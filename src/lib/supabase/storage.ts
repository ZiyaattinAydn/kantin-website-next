/**
 * Supabase Storage için ortak bucket, dosya tipi ve boyut kuralları.
 * Bu kontroller kullanıcı deneyimi sağlar; gerçek güvenlik bucket kısıtları,
 * Storage RLS ve ilerideki sunucu doğrulamasıyla birlikte uygulanır.
 */

export const STORAGE_BUCKETS = {
  menuImages: "menu-images",
  eventImages: "event-images",
  merchImages: "merch-images",
  galleryImages: "gallery-images",
  instagramMedia: "instagram-media",
  careerCvs: "career-cvs",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export const PUBLIC_IMAGE_BUCKETS = [
  STORAGE_BUCKETS.menuImages,
  STORAGE_BUCKETS.eventImages,
  STORAGE_BUCKETS.merchImages,
  STORAGE_BUCKETS.galleryImages,
  STORAGE_BUCKETS.instagramMedia,
] as const satisfies readonly StorageBucket[];

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const CV_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const STORAGE_LIMITS = {
  imageBytes: 8 * 1024 * 1024,
  cvBytes: 5 * 1024 * 1024,
} as const;

const EXTENSIONS_BY_MIME_TYPE: Readonly<Record<string, readonly string[]>> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/avif": ["avif"],
  "application/pdf": ["pdf"],
  "application/msword": ["doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    "docx",
  ],
};

type FileDescriptor = Pick<File, "name" | "size" | "type">;

export type StorageFileValidationErrorCode =
  | "empty_file"
  | "file_too_large"
  | "unsupported_mime_type"
  | "invalid_extension";

export type StorageFileValidationResult =
  | { ok: true }
  | {
      ok: false;
      code: StorageFileValidationErrorCode;
      message: string;
    };

function getFileExtension(fileName: string): string {
  const extension = fileName.split(".").pop();
  return extension?.trim().toLowerCase() ?? "";
}

function isPublicImageBucket(
  bucket: StorageBucket,
): bucket is (typeof PUBLIC_IMAGE_BUCKETS)[number] {
  return PUBLIC_IMAGE_BUCKETS.includes(
    bucket as (typeof PUBLIC_IMAGE_BUCKETS)[number],
  );
}

/**
 * Dosyayı seçilen bucket'ın istemci tarafı kurallarıyla doğrular.
 * CV akışında ayrıca sunucu tarafında MIME/imza kontrolü yapılacaktır.
 */
export function validateStorageFile(
  file: FileDescriptor,
  bucket: StorageBucket,
): StorageFileValidationResult {
  if (file.size <= 0) {
    return {
      ok: false,
      code: "empty_file",
      message: "Boş dosya yüklenemez.",
    };
  }

  const isImage = isPublicImageBucket(bucket);
  const allowedMimeTypes: readonly string[] = isImage
    ? IMAGE_MIME_TYPES
    : CV_MIME_TYPES;
  const maxBytes = isImage ? STORAGE_LIMITS.imageBytes : STORAGE_LIMITS.cvBytes;

  if (file.size > maxBytes) {
    return {
      ok: false,
      code: "file_too_large",
      message: isImage
        ? "Görsel dosyası en fazla 8 MB olabilir."
        : "CV dosyası en fazla 5 MB olabilir.",
    };
  }

  const normalizedMimeType = file.type.trim().toLowerCase();

  if (!allowedMimeTypes.includes(normalizedMimeType)) {
    return {
      ok: false,
      code: "unsupported_mime_type",
      message: isImage
        ? "Yalnız JPG, PNG, WebP veya AVIF görselleri yüklenebilir."
        : "CV yalnız PDF, DOC veya DOCX biçiminde yüklenebilir.",
    };
  }

  const extension = getFileExtension(file.name);
  const allowedExtensions = EXTENSIONS_BY_MIME_TYPE[normalizedMimeType] ?? [];

  if (!allowedExtensions.includes(extension)) {
    return {
      ok: false,
      code: "invalid_extension",
      message: "Dosya uzantısı ile dosya türü eşleşmiyor.",
    };
  }

  return { ok: true };
}

/**
 * Orijinal dosya adını Storage yoluna taşımadan tahmin edilmesi zor bir nesne
 * yolu üretir. scopeId ileride kayıt UUID'si olarak kullanılacaktır.
 */
export function createStorageObjectPath(
  scopeId: string,
  file: FileDescriptor,
): string {
  const safeScopeId = scopeId.trim().toLowerCase();

  if (!/^[a-z0-9_-]{8,80}$/.test(safeScopeId)) {
    throw new Error("Geçersiz Storage kapsam kimliği.");
  }

  const extension = getFileExtension(file.name);

  if (!extension) {
    throw new Error("Dosya uzantısı bulunamadı.");
  }

  return `${safeScopeId}/${crypto.randomUUID()}.${extension}`;
}
