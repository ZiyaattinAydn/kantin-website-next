import { describe, expect, it } from "vitest";
import {
  hashRequestSignal,
  validateCareerApplicationForm,
} from "@/lib/careers/validation";
import { careerFormData } from "../../helpers/files";

describe("validateCareerApplicationForm", () => {
  it("geçerli TEST_ PDF başvurusunu normalize eder", async () => {
    const result = await validateCareerApplicationForm(careerFormData());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.branchSlug).toBe("either");
    expect(result.data.employmentType).toBe("part_time");
    expect(result.data.availabilityDays).toEqual(["monday", "friday"]);
    expect(result.data.cvExtension).toBe("pdf");
  });

  it("honeypot dolu başvuruyu reddeder", async () => {
    const result = await validateCareerApplicationForm(
      careerFormData({ website: "https://spam.example" }),
    );

    expect(result).toEqual({ ok: false, message: "Başvuru gönderilemedi." });
  });

  it("çok hızlı gönderimi reddeder", async () => {
    const result = await validateCareerApplicationForm(
      careerFormData({ formStartedAt: String(Date.now()) }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain("çok hızlı");
  });

  it("uzantısı ve içeriği uyuşmayan CV'yi reddeder", async () => {
    const fakePdf = new File(["not a pdf"], "TEST_cv.pdf", {
      type: "application/pdf",
    });
    const result = await validateCareerApplicationForm(
      careerFormData({ cv: fakePdf }),
    );

    expect(result).toMatchObject({ ok: false, field: "cv" });
  });
});

describe("hashRequestSignal", () => {
  it("aynı sinyal için kararlı ve ham değerden farklı hash üretir", () => {
    const first = hashRequestSignal("127.0.0.1", "ip");
    const second = hashRequestSignal("127.0.0.1", "ip");

    expect(first).toBe(second);
    expect(first).toHaveLength(64);
    expect(first).not.toContain("127.0.0.1");
  });
});
