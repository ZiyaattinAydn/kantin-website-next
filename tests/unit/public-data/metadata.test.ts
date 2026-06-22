import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createPublicClient: vi.fn(),
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: mocks.createPublicClient,
}));

import {
  getPagePublicMetadata,
  pageMetadataFromRow,
} from "@/lib/public-data/metadata";

const fallback = {
  title: "Fallback başlık",
  description: "Fallback açıklama",
  canonical: "/test",
};

describe("public sayfa metadata", () => {
  beforeEach(() => vi.clearAllMocks());

  it("admin SEO alanlarını metadata'ya dönüştürür", () => {
    expect(pageMetadataFromRow({
      title: "TEST_ Sayfa",
      seo_title: "TEST_ SEO",
      seo_description: "TEST_ SEO açıklaması",
    }, fallback)).toMatchObject({
      title: "TEST_ SEO",
      description: "TEST_ SEO açıklaması",
      alternates: { canonical: "/test" },
    });
  });

  it("SEO başlığı yoksa admin sayfa başlığını kullanır", () => {
    expect(pageMetadataFromRow({
      title: "TEST_ Sayfa",
      seo_title: null,
      seo_description: null,
    }, fallback).title).toBe("TEST_ Sayfa");
  });

  it("Supabase hatasında statik metadata fallback'ine döner", async () => {
    mocks.createPublicClient.mockImplementation(() => {
      throw new Error("TEST_ offline");
    });

    await expect(getPagePublicMetadata("test", fallback)).resolves.toMatchObject({
      title: fallback.title,
      description: fallback.description,
    });
  });

  it("yayındaki site_pages kaydını sorgular", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        title: "TEST_ Sayfa",
        seo_title: "TEST_ Canlı SEO",
        seo_description: "TEST_ Canlı açıklama",
      },
      error: null,
    });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    mocks.createPublicClient.mockReturnValue({ from });

    await expect(getPagePublicMetadata("test", fallback)).resolves.toMatchObject({
      title: "TEST_ Canlı SEO",
      description: "TEST_ Canlı açıklama",
    });
    expect(from).toHaveBeenCalledWith("site_pages");
    expect(eq).toHaveBeenCalledWith("slug", "test");
  });
});
