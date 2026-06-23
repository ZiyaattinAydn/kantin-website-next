"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  careerAvailabilityDays,
  careerDepartments,
  careerEmploymentTypes,
  careersContactEmail,
  type CareerDepartmentId,
} from "@/data/careers";
import { STORAGE_BUCKETS, validateStorageFile } from "@/lib/supabase/storage";
import styles from "./CareersPage.module.css";

const careerFormDoodles = [
  "/assets/img/merch/doodles/table-friends.png",
  "/assets/img/merch/doodles/high-five.png",
  "/assets/img/merch/doodles/jumping.png",
  "/assets/img/merch/doodles/walking.png",
  "/assets/img/merch/doodles/hugging.png",
  "/assets/img/merch/doodles/sharing-drink.png",
  "/assets/img/merch/doodles/bar-friends.png",
  "/assets/img/merch/doodles/cats-table.png",
  "/assets/img/merch/doodles/looking-up.png",
  "/assets/img/merch/doodles/table-friends.png",
  "/assets/img/merch/doodles/high-five.png",
  "/assets/img/merch/doodles/jumping.png",
  "/assets/img/merch/doodles/walking.png",
  "/assets/img/merch/doodles/hugging.png",
  "/assets/img/merch/doodles/sharing-drink.png",
  "/assets/img/merch/doodles/bar-friends.png",
  "/assets/img/merch/doodles/cats-table.png",
  "/assets/img/merch/doodles/looking-up.png",
] as const;

function getDepartment(id: string) {
  return careerDepartments.find((department) => department.id === id);
}

export default function CareersPage({
  branchOptions,
}: {
  branchOptions: Array<{ id: string; label: string }>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const formStartedAtRef = useRef(0);
  const [departmentId, setDepartmentId] = useState<CareerDepartmentId>("service");
  const [shiftId, setShiftId] = useState("morning");
  const [fileError, setFileError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [submissionState, setSubmissionState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionReference, setSubmissionReference] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  const selectedDepartment = useMemo(
    () => getDepartment(departmentId) ?? careerDepartments[0],
    [departmentId],
  );

  useEffect(() => {
    formStartedAtRef.current = Date.now();
  }, []);

  const handleDepartmentChange = (nextDepartmentId: CareerDepartmentId) => {
    const nextDepartment = getDepartment(nextDepartmentId) ?? careerDepartments[0];
    setDepartmentId(nextDepartmentId);
    setShiftId(nextDepartment.shifts[0].id);
    setSubmissionState("idle");
    setSubmissionMessage("");
  };

  const handleFileChange = (file: File | undefined) => {
    setSubmissionState("idle");
    setSubmissionMessage("");

    if (!file) {
      setFileError("");
      return;
    }

    const validation = validateStorageFile(file, STORAGE_BUCKETS.careerCvs);
    setFileError(validation.ok ? "" : validation.message);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const availability = formData.getAll("availability").map(String);
    const cv = formData.get("cv");

    setSubmissionState("idle");
    setSubmissionMessage("");
    setSubmissionReference("");

    if (!availability.length) {
      setAvailabilityError("En az bir uygun gün seçmelisin.");
      form.querySelector<HTMLInputElement>('input[name="availability"]')?.focus();
      return;
    }

    setAvailabilityError("");

    if (!(cv instanceof File) || !cv.size) {
      setFileError("CV dosyası zorunludur.");
      form.querySelector<HTMLInputElement>('input[name="cv"]')?.focus();
      return;
    }

    const fileValidation = validateStorageFile(cv, STORAGE_BUCKETS.careerCvs);
    if (!fileValidation.ok) {
      setFileError(fileValidation.message);
      form.querySelector<HTMLInputElement>('input[name="cv"]')?.focus();
      return;
    }

    setFileError("");
    setSubmissionState("submitting");
    formData.set("formStartedAt", String(formStartedAtRef.current));
    formData.set("website", "");

    try {
      const response = await fetch("/api/careers/applications", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const result = (await response.json()) as {
        ok?: boolean;
        field?: string;
        message?: string;
        reference?: string;
      };

      if (!response.ok || !result.ok) {
        setSubmissionState("error");
        setSubmissionMessage(
          result.message || "Başvuru gönderilemedi. Lütfen tekrar deneyin.",
        );
        if (result.field) {
          form.querySelector<HTMLElement>(`[name="${result.field}"]`)?.focus();
        }
        return;
      }

      const fullName = String(formData.get("fullName") || "").trim();
      setSubmittedName(fullName);
      setSubmissionReference(result.reference || "");
      setSubmissionMessage(result.message || "Başvurunuz başarıyla alındı.");
      setSubmissionState("success");
      form.reset();
      setDepartmentId("service");
      setShiftId("morning");
      setAvailabilityError("");
      setFileError("");
      formStartedAtRef.current = Date.now();
    } catch {
      setSubmissionState("error");
      setSubmissionMessage(
        "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.",
      );
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <img
          alt=""
          aria-hidden="true"
          className={`${styles.doodle} ${styles.doodleOne}`}
          src="/assets/img/merch/doodles/table-friends.png"
        />
        <img
          alt=""
          aria-hidden="true"
          className={`${styles.doodle} ${styles.doodleTwo}`}
          src="/assets/img/merch/doodles/high-five.png"
        />

        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">Ekibe katıl</p>
            <h1>
              Ritme sen de <span>katıl.</span>
            </h1>
            <p>
              Servis, mutfak, bar ve kasa ekipleri için genel başvuru formu.
              Samimi, hızlı ve birlikte çalışan bir ekibin parçası olmak isteyenleri bekliyoruz.
            </p>
            <div className={styles.heroActions}>
              <a href="#basvuru">Başvuruya geç <span aria-hidden="true">↓</span></a>
              <Link href="/#anilarimiz">Ekibi tanı</Link>
            </div>
          </div>

          <aside className={styles.heroCard}>
            <p className={styles.cardLabel}>Aktif şubelerde</p>
            <strong>
              {branchOptions
                .filter((branch) => branch.id !== "either")
                .map((branch) => branch.label)
                .join(" + ") || "Kantin"}
            </strong>
            <p>
              Başvuru sırasında aktif şubelerden birini seçebilir veya esnek olduğunu belirtebilirsin.
            </p>
            <div className={styles.heroTags}>
              <span>Part-time uygun</span>
              <span>4 çalışma alanı</span>
              <span>CV yükleme</span>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.scheduleSection} aria-labelledby="schedule-title">
        <div className="container">
          <div className={styles.sectionHeading}>
            <div>
              <p className="eyebrow">Vardiyalar net olsun</p>
              <h2 id="schedule-title">Çalışma alanları.</h2>
            </div>
            <p>
              Part-time başvuru her alanda yapılabilir. Servis ve mutfakta sabah-akşam,
              bar ve kasada akşam vardiyası bulunuyor.
            </p>
          </div>

          <div className={styles.departmentGrid}>
            {careerDepartments.map((department, index) => (
              <article className={styles.departmentCard} key={department.id}>
                <span className={styles.departmentNumber}>0{index + 1}</span>
                <h3>{department.label}</h3>
                <p>{department.description}</p>
                <div className={styles.shiftList}>
                  {department.shifts.map((shift) => (
                    <div key={shift.id}>
                      <span>{shift.label}</span>
                      <strong>{shift.hours}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.formSection} id="basvuru" aria-labelledby="application-title">
        <div className={styles.formDoodles} aria-hidden="true">
          {careerFormDoodles.map((src, index) => (
            <img
              alt=""
              className={`${styles.formDoodle} ${styles[`formDoodle${index + 1}`]}`}
              key={`${src}-${index}`}
              src={src}
            />
          ))}
        </div>

        <div className={`container ${styles.formLayout}`}>
          <aside className={styles.formIntro}>
            <p className="eyebrow">Genel başvuru</p>
            <h2 id="application-title">Kendinden biraz bahset.</h2>
            <p>
              Alanını, vardiyanı ve uygun olduğun günleri seç; deneyimini kısaca paylaş
              ve CV’ni ekleyerek başvurunu hazırla.
            </p>

            <div className={styles.processList}>
              <div><span>1</span><p>Alanını ve vardiyanı seç.</p></div>
              <div><span>2</span><p>Uygun günlerini ve deneyimini paylaş.</p></div>
              <div><span>3</span><p>CV’ni ekleyip başvurunu tamamla.</p></div>
            </div>

            <p className={styles.temporaryNote}>
              Teknik sorun yaşarsan: <a href={`mailto:${careersContactEmail}`}>{careersContactEmail}</a>
            </p>
          </aside>

          <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate={false}>
            <label className={styles.honeypot} aria-hidden="true">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <fieldset className={styles.fieldset}>
              <legend>İletişim bilgileri</legend>
              <div className={styles.twoColumns}>
                <label>
                  <span>Ad soyad</span>
                  <input name="fullName" autoComplete="name" required />
                </label>
                <label>
                  <span>Telefon</span>
                  <input
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="05xx xxx xx xx"
                    required
                  />
                </label>
              </div>
              <label>
                <span>E-posta</span>
                <input name="email" type="email" autoComplete="email" required />
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend>Başvuru tercihi</legend>
              <div className={styles.twoColumns}>
                <label>
                  <span>Şube</span>
                  <select name="branch" defaultValue="either" required>
                    {branchOptions.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Çalışma biçimi</span>
                  <select name="employmentType" defaultValue="part-time" required>
                    {careerEmploymentTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>Çalışma alanı</span>
                <select
                  name="department"
                  value={departmentId}
                  onChange={(event) => handleDepartmentChange(event.target.value as CareerDepartmentId)}
                  required
                >
                  {careerDepartments.map((department) => (
                    <option key={department.id} value={department.id}>{department.label}</option>
                  ))}
                </select>
              </label>

              <div className={styles.choiceGroup}>
                <span>Vardiya</span>
                <div className={styles.radioGrid}>
                  {selectedDepartment.shifts.map((shift) => (
                    <label className={styles.choiceCard} key={shift.id}>
                      <input
                        type="radio"
                        name="shift"
                        value={shift.id}
                        checked={shiftId === shift.id}
                        onChange={() => setShiftId(shift.id)}
                        required
                      />
                      <span>
                        <strong>{shift.label}</strong>
                        <small>{shift.hours}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend>Uygunluk ve deneyim</legend>
              <div className={styles.choiceGroup}>
                <span>Hangi günler uygunsun?</span>
                <div className={styles.dayGrid}>
                  {careerAvailabilityDays.map((day) => (
                    <label key={day}>
                      <input
                        type="checkbox"
                        name="availability"
                        value={day}
                        onChange={() => {
                          setAvailabilityError("");
                          setSubmissionState("idle");
                          setSubmissionMessage("");
                        }}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
                {availabilityError ? <p className={styles.error}>{availabilityError}</p> : null}
              </div>

              <div className={styles.choiceGroup}>
                <span>Daha önce benzer bir işte çalıştın mı?</span>
                <div className={styles.inlineChoices}>
                  <label><input type="radio" name="experience" value="Evet" required /> Evet</label>
                  <label><input type="radio" name="experience" value="Hayır" required /> Hayır</label>
                </div>
              </div>

              <label>
                <span>Kendinden kısaca bahset</span>
                <textarea
                  name="about"
                  rows={6}
                  maxLength={1200}
                  placeholder="Deneyimin, çalışma yaklaşımın ve Kantin ekibine neden katılmak istediğin..."
                  required
                />
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend>CV ve onay</legend>
              <label className={styles.fileField}>
                <span>CV yükle <small>PDF, DOC veya DOCX · en fazla 5 MB</small></span>
                <input
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => handleFileChange(event.target.files?.[0])}
                  required
                />
              </label>
              {fileError ? <p className={styles.error}>{fileError}</p> : null}

              <label className={styles.consent}>
                <input name="consent" type="checkbox" required />
                <span>
                  Paylaştığım bilgilerin yalnızca işe alım değerlendirmesi amacıyla
                  kullanılmasını kabul ediyorum.
                </span>
              </label>
            </fieldset>

            <button
              className={styles.submitButton}
              type="submit"
              disabled={submissionState === "submitting"}
              aria-busy={submissionState === "submitting"}
            >
              {submissionState === "submitting" ? "Başvuru gönderiliyor…" : "Başvuruyu gönder"}
              <span aria-hidden="true">↗</span>
            </button>

            {submissionState === "success" ? (
              <div className={styles.success} role="status">
                <div>
                  <strong>{submittedName}, başvurun alındı.</strong>
                  <p>
                    {submissionMessage} CV dosyan private olarak saklandı ve yalnız yetkili
                    ekip tarafından görüntülenebilir.
                    {submissionReference ? ` Referans: ${submissionReference}` : ""}
                  </p>
                </div>
              </div>
            ) : null}

            {submissionState === "error" ? (
              <div className={styles.submissionError} role="alert">
                <strong>Başvuru gönderilemedi.</strong>
                <p>{submissionMessage}</p>
              </div>
            ) : null}
          </form>
        </div>
      </section>
    </div>
  );
}
