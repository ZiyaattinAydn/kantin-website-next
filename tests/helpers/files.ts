export function validPdfFile(name = "TEST_cv.pdf") {
  return new File([new TextEncoder().encode("%PDF-1.4\n% TEST CV\n")], name, {
    type: "application/pdf",
  });
}

export function validImageFile(name = "TEST_image.webp") {
  return new File([new Uint8Array([0x52, 0x49, 0x46, 0x46])], name, {
    type: "image/webp",
  });
}

export function careerFormData(overrides: Record<string, string | File> = {}) {
  const form = new FormData();
  const defaults: Record<string, string | File> = {
    website: "",
    formStartedAt: String(Date.now() - 5_000),
    fullName: "TEST_ Aday",
    phone: "0500 000 00 00",
    email: "test-aday@example.com",
    branch: "either",
    department: "service",
    employmentType: "part-time",
    shift: "morning",
    experience: "Hayır",
    about: "Test başvurusu için yeterince uzun örnek tanıtım metni.",
    consent: "on",
    cv: validPdfFile(),
  };

  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    form.set(key, value);
  }
  form.append("availability", "Pazartesi");
  form.append("availability", "Cuma");
  return form;
}
