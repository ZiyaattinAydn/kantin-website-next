export type SupabasePublicEnv = Readonly<{
  url: string;
  publishableKey: string;
}>;

let cachedEnv: SupabasePublicEnv | null = null;

function readRequiredValue(name: string, value: string | undefined): string {
  const normalisedValue = value?.trim();

  if (!normalisedValue) {
    throw new Error(
      `${name} tanımlı değil. Proje kökündeki .env.local dosyasını kontrol edin.`,
    );
  }

  return normalisedValue;
}

function validateSupabaseUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL geçerli bir URL olmalıdır.");
  }

  const isLocalDevelopmentUrl =
    url.hostname === "localhost" || url.hostname === "127.0.0.1";

  if (url.protocol !== "https:" && !isLocalDevelopmentUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL üretim ortamında HTTPS kullanmalıdır.",
    );
  }

  return url.origin;
}

function validatePublishableKey(value: string): string {
  if (value.startsWith("sb_secret_")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY alanına secret key yazılamaz.",
    );
  }

  if (!value.startsWith("sb_publishable_")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, sb_publishable_ ile başlayan publishable key olmalıdır.",
    );
  }

  return value;
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  if (cachedEnv) return cachedEnv;

  const url = validateSupabaseUrl(
    readRequiredValue(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
  );
  const publishableKey = validatePublishableKey(
    readRequiredValue(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  );

  cachedEnv = Object.freeze({ url, publishableKey });
  return cachedEnv;
}
