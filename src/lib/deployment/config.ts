const DEFAULT_LOCAL_URL = "http://localhost:3000";

export type SiteEnvironment = "development" | "preview" | "production";

function normalizeSiteUrl(value: string): URL {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(withProtocol);

  url.pathname = "/";
  url.search = "";
  url.hash = "";

  return url;
}

function getSiteEnvironment(): SiteEnvironment {
  const explicit = process.env.SITE_ENV?.trim().toLowerCase();

  if (explicit === "production" || explicit === "preview") {
    return explicit;
  }

  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV === "preview") return "preview";

  return "development";
}

export function getSiteUrl(): URL {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicitUrl) return normalizeSiteUrl(explicitUrl);

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) return normalizeSiteUrl(productionUrl);

  const deploymentUrl = process.env.VERCEL_URL?.trim();
  if (deploymentUrl) return normalizeSiteUrl(deploymentUrl);

  return new URL(DEFAULT_LOCAL_URL);
}

export function isIndexableDeployment(): boolean {
  return getSiteEnvironment() === "production";
}

export function getDeploymentReadiness() {
  const environment = getSiteEnvironment();
  const siteUrl = getSiteUrl();
  const isHttps = siteUrl.protocol === "https:";
  const supabaseUrlConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
  );
  const supabaseKeyConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
  );
  const siteUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim());
  const productionReady =
    environment !== "production" ||
    (isHttps &&
      siteUrlConfigured &&
      supabaseUrlConfigured &&
      supabaseKeyConfigured);

  return {
    environment,
    siteUrl: siteUrl.origin,
    indexable: isIndexableDeployment(),
    checks: {
      https: isHttps,
      siteUrlConfigured,
      supabaseUrlConfigured,
      supabaseKeyConfigured,
    },
    productionReady,
  } as const;
}
