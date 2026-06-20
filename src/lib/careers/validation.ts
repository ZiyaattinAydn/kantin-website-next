import { createHash } from "node:crypto";
import {
  careerAvailabilityDays,
  careerBranches,
  careerDepartments,
  careerEmploymentTypes,
} from "@/data/careers";
import {
  CV_MIME_TYPES,
  STORAGE_BUCKETS,
  validateStorageFile,
} from "@/lib/supabase/storage";

export const CAREER_CONSENT_VERSION = "2026-06-20-v1";
export const CAREER_FORM_MIN_FILL_MS = 2_000;
export const CAREER_FORM_MAX_AGE_MS = 2 * 60 * 60 * 1_000;
export const CAREER_MAX_REQUEST_BYTES = 6 * 1024 * 1024;

const AVAILABILITY_DB_VALUE: Readonly<Record<string, string>> = {
  Pazartesi: "monday",
  Salı: "tuesday",
  Çarşamba: "wednesday",
  Perşembe: "thursday",
  Cuma: "friday",
  Cumartesi: "saturday",
  Pazar: "sunday",
};

const EMPLOYMENT_DB_VALUE: Readonly<Record<string, "full_time" | "part_time">> = {
  "full-time": "full_time",
  "part-time": "part_time",
};

const EXPERIENCE_DB_VALUE: Readonly<Record<string, "yes" | "no">> = {
  Evet: "yes",
  Hayır: "no",
};

export type CareerApplicationInput = {
  fullName: string;
  phone: string;
  email: string;
  branchSlug: "alsancak" | "atakent" | "either";
  department: "service" | "kitchen" | "bar" | "cashier";
  employmentType: "full_time" | "part_time";
  shiftPreference: "morning" | "evening";
  availabilityDays: string[];
  experience: "yes" | "no";
  introduction: string;
  consentGiven: true;
  cv: File;
  cvExtension: "pdf" | "doc" | "docx";
};

export type CareerValidationResult =
  | { ok: true; data: CareerApplicationInput }
  | { ok: false; field?: string; message: string };

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  return value.length >= 7 && value.length <= 30 && /^[+0-9()\s-]+$/.test(value);
}

function extensionOf(fileName: string): string {
  return fileName.split(".").pop()?.trim().toLowerCase() ?? "";
}

function hasPrefix(bytes: Uint8Array, prefix: readonly number[]): boolean {
  return prefix.every((value, index) => bytes[index] === value);
}

function includesAscii(bytes: Uint8Array, needle: string): boolean {
  const target = new TextEncoder().encode(needle);

  outer: for (let index = 0; index <= bytes.length - target.length; index += 1) {
    for (let inner = 0; inner < target.length; inner += 1) {
      if (bytes[index + inner] !== target[inner]) {
        continue outer;
      }
    }
    return true;
  }

  return false;
}

async function fileSignatureMatches(file: File, extension: string): Promise<boolean> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (extension === "pdf") {
    return hasPrefix(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  }

  if (extension === "doc") {
    return hasPrefix(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  }

  if (extension === "docx") {
    const hasZipHeader =
      hasPrefix(bytes, [0x50, 0x4b, 0x03, 0x04]) ||
      hasPrefix(bytes, [0x50, 0x4b, 0x05, 0x06]) ||
      hasPrefix(bytes, [0x50, 0x4b, 0x07, 0x08]);

    return (
      hasZipHeader &&
      includesAscii(bytes, "[Content_Types].xml") &&
      includesAscii(bytes, "word/")
    );
  }

  return false;
}

export async function validateCareerApplicationForm(
  formData: FormData,
): Promise<CareerValidationResult> {
  const honeypot = readText(formData, "website");
  if (honeypot) {
    return { ok: false, message: "Başvuru gönderilemedi." };
  }

  const startedAt = Number(readText(formData, "formStartedAt"));
  const elapsed = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || elapsed < CAREER_FORM_MIN_FILL_MS) {
    return { ok: false, message: "Form çok hızlı gönderildi. Lütfen tekrar deneyin." };
  }
  if (elapsed > CAREER_FORM_MAX_AGE_MS) {
    return { ok: false, message: "Formun süresi doldu. Sayfayı yenileyip tekrar deneyin." };
  }

  const fullName = readText(formData, "fullName").replace(/\s+/g, " ");
  if (fullName.length < 2 || fullName.length > 120) {
    return { ok: false, field: "fullName", message: "Ad soyad 2–120 karakter olmalı." };
  }

  const phone = readText(formData, "phone");
  if (!isValidPhone(phone)) {
    return { ok: false, field: "phone", message: "Geçerli bir telefon numarası girin." };
  }

  const email = readText(formData, "email").toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, field: "email", message: "Geçerli bir e-posta adresi girin." };
  }

  const branchSlug = readText(formData, "branch");
  if (!careerBranches.some((branch) => branch.id === branchSlug)) {
    return { ok: false, field: "branch", message: "Geçerli bir şube seçin." };
  }

  const department = readText(formData, "department");
  const departmentConfig = careerDepartments.find((item) => item.id === department);
  if (!departmentConfig) {
    return { ok: false, field: "department", message: "Geçerli bir çalışma alanı seçin." };
  }

  const employmentRaw = readText(formData, "employmentType");
  if (!careerEmploymentTypes.some((item) => item.id === employmentRaw)) {
    return { ok: false, field: "employmentType", message: "Geçerli bir çalışma biçimi seçin." };
  }
  const employmentType = EMPLOYMENT_DB_VALUE[employmentRaw];
  if (!employmentType) {
    return { ok: false, field: "employmentType", message: "Geçerli bir çalışma biçimi seçin." };
  }

  const shiftPreference = readText(formData, "shift");
  if (!departmentConfig.shifts.some((shift) => shift.id === shiftPreference)) {
    return { ok: false, field: "shift", message: "Seçilen alan için geçerli bir vardiya seçin." };
  }

  const availabilityLabels = formData
    .getAll("availability")
    .filter((value): value is string => typeof value === "string");
  const validLabels = new Set(careerAvailabilityDays);
  const uniqueLabels = [...new Set(availabilityLabels)];
  if (!uniqueLabels.length || uniqueLabels.some((day) => !validLabels.has(day as never))) {
    return { ok: false, field: "availability", message: "En az bir geçerli gün seçin." };
  }
  const availabilityDays = uniqueLabels.map((day) => AVAILABILITY_DB_VALUE[day]);
  if (availabilityDays.some((day) => !day)) {
    return { ok: false, field: "availability", message: "Geçerli günleri seçin." };
  }

  const experienceRaw = readText(formData, "experience");
  const experience = EXPERIENCE_DB_VALUE[experienceRaw];
  if (!experience) {
    return { ok: false, field: "experience", message: "Deneyim seçimini tamamlayın." };
  }

  const introduction = readText(formData, "about");
  if (introduction.length < 20 || introduction.length > 1200) {
    return {
      ok: false,
      field: "about",
      message: "Kısa tanıtım 20–1200 karakter arasında olmalı.",
    };
  }

  if (readText(formData, "consent") !== "on") {
    return { ok: false, field: "consent", message: "Açık rıza/onay alanı zorunludur." };
  }

  const cv = formData.get("cv");
  if (!(cv instanceof File) || cv.size <= 0) {
    return { ok: false, field: "cv", message: "CV dosyası zorunludur." };
  }

  const fileValidation = validateStorageFile(cv, STORAGE_BUCKETS.careerCvs);
  if (!fileValidation.ok) {
    return { ok: false, field: "cv", message: fileValidation.message };
  }

  const cvExtension = extensionOf(cv.name);
  if (cvExtension !== "pdf" && cvExtension !== "doc" && cvExtension !== "docx") {
    return { ok: false, field: "cv", message: "CV yalnız PDF, DOC veya DOCX olabilir." };
  }

  if (!CV_MIME_TYPES.includes(cv.type as (typeof CV_MIME_TYPES)[number])) {
    return { ok: false, field: "cv", message: "CV dosya türü doğrulanamadı." };
  }

  if (!(await fileSignatureMatches(cv, cvExtension))) {
    return {
      ok: false,
      field: "cv",
      message: "CV dosyasının içeriği seçilen dosya biçimiyle eşleşmiyor.",
    };
  }

  return {
    ok: true,
    data: {
      fullName,
      phone,
      email,
      branchSlug: branchSlug as CareerApplicationInput["branchSlug"],
      department: department as CareerApplicationInput["department"],
      employmentType,
      shiftPreference: shiftPreference as CareerApplicationInput["shiftPreference"],
      availabilityDays,
      experience,
      introduction,
      consentGiven: true,
      cv,
      cvExtension,
    },
  };
}

export function hashRequestSignal(value: string | null, label: string): string | null {
  const normalized = value?.trim();
  if (!normalized) return null;

  return createHash("sha256")
    .update(`kantin-careers-v1:${label}:${normalized}`)
    .digest("hex");
}
