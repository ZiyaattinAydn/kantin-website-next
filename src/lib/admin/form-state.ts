function controlValue(control: Element): string | null {
  if (control instanceof HTMLButtonElement) return null;
  if (control instanceof HTMLInputElement) {
    if (["button", "submit", "reset", "image"].includes(control.type))
      return null;
    if (control.type === "checkbox" || control.type === "radio") {
      return `${control.name}:${control.type}:${control.checked ? "1" : "0"}:${control.value}`;
    }
    if (control.type === "file") {
      const files = Array.from(control.files ?? []).map(
        (file) => `${file.name}:${file.size}:${file.lastModified}`,
      );
      return `${control.name}:file:${files.join("|")}`;
    }
    return `${control.name}:${control.type}:${control.value}`;
  }
  if (control instanceof HTMLSelectElement) {
    const values = Array.from(control.selectedOptions).map(
      (option) => option.value,
    );
    return `${control.name}:select:${values.join("|")}`;
  }
  if (control instanceof HTMLTextAreaElement) {
    return `${control.name}:textarea:${control.value}`;
  }
  return null;
}

export function snapshotAdminForm(form: HTMLFormElement): string {
  return Array.from(form.elements)
    .map((control) => controlValue(control))
    .filter((value): value is string => value !== null)
    .join("\u001f");
}
