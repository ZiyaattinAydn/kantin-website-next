// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminInteractionGuard, {
  snapshotAdminForm,
} from "@/components/admin/AdminInteractionGuard";

afterEach(() => {
  vi.restoreAllMocks();
});

function Example() {
  return (
    <div id="admin-test-root">
      <AdminInteractionGuard rootId="admin-test-root" />
      <details data-admin-accordion-item="true" open>
        <summary>Birinci kayıt</summary>
        <form data-admin-dirty-guard="true">
          <label>
            Ad
            <input defaultValue="İlk değer" name="name" />
          </label>
        </form>
      </details>
      <details data-admin-accordion-item="true">
        <summary>İkinci kayıt</summary>
        <form data-admin-dirty-guard="true">
          <input defaultValue="İkinci" name="name" />
        </form>
      </details>
    </div>
  );
}


function VisibilityExample({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div id="admin-visibility-root">
      <AdminInteractionGuard rootId="admin-visibility-root" />
      <form
        data-active-field="is_active"
        data-admin-dirty-guard="true"
        data-admin-visibility-guard="true"
        data-current-active="true"
        data-current-status="published"
        data-is-new="false"
        data-record-label="TEST Ürün"
        data-status-field="status"
        data-visibility-impact="Ürün ziyaretçi menüsünden kaldırılır."
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <input defaultValue="" name="_visibility_confirm" type="hidden" />
        <select aria-label="Yayın durumu" defaultValue="published" name="status">
          <option value="draft">Taslak</option>
          <option value="published">Yayında</option>
          <option value="archived">Arşiv</option>
        </select>
        <input defaultChecked name="is_active" type="checkbox" />
        <button type="submit">Kaydet</button>
      </form>
    </div>
  );
}

describe("AdminInteractionGuard", () => {
  it("form alanı değiştiğinde kaydedilmemiş değişiklik uyarısını gösterir", async () => {
    const user = userEvent.setup();
    render(<Example />);

    const input = screen.getByLabelText("Ad");
    await user.clear(input);
    await user.type(input, "Yeni değer");

    expect(screen.getByText("Kaydedilmemiş değişiklikler var")).toBeInTheDocument();
  });

  it("kullanıcı vazgeçerse kirli satırı kapatmaz ve diğer satırı açmaz", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<Example />);

    const first = screen.getByText("Birinci kayıt").closest("details")!;
    const second = screen.getByText("İkinci kayıt").closest("details")!;
    await user.type(screen.getByLabelText("Ad"), " değişti");
    await user.click(screen.getByText("İkinci kayıt"));

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(first).toHaveAttribute("open");
    expect(second).not.toHaveAttribute("open");
  });

  it("onay verilince eski formu sıfırlar ve yalnız yeni satırı açık bırakır", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Example />);

    const input = screen.getByLabelText("Ad");
    const first = screen.getByText("Birinci kayıt").closest("details")!;
    const second = screen.getByText("İkinci kayıt").closest("details")!;
    await user.clear(input);
    await user.type(input, "Kaydedilmemiş");
    await user.click(screen.getByText("İkinci kayıt"));

    expect(first).not.toHaveAttribute("open");
    expect(second).toHaveAttribute("open");
    expect(input).toHaveValue("İlk değer");
    await waitFor(() => {
      expect(screen.queryByText("Kaydedilmemiş değişiklikler var")).not.toBeInTheDocument();
    });
  });

  it("form snapshotında checkbox ve metin değişikliklerini ayırt eder", () => {
    const form = document.createElement("form");
    form.innerHTML = `
      <input name="name" value="Kantin" />
      <input name="active" type="checkbox" checked />
    `;
    const first = snapshotAdminForm(form);
    (form.elements.namedItem("active") as HTMLInputElement).checked = false;

    expect(snapshotAdminForm(form)).not.toBe(first);
  });

  it("yayındaki kaydı gizlerken PASİFE AL yazılmadığında gönderimi durdurur", async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    vi.spyOn(window, "prompt").mockReturnValue("yanlış");
    render(<VisibilityExample onSubmit={submit} />);

    await user.selectOptions(screen.getByLabelText("Yayın durumu"), "draft");
    await user.click(screen.getByRole("button", { name: "Kaydet" }));

    expect(window.prompt).toHaveBeenCalledWith(expect.stringContaining("PASİFE AL"));
    expect(submit).not.toHaveBeenCalled();
    expect(document.querySelector<HTMLInputElement>('input[name="_visibility_confirm"]')).toHaveValue("");
  });

  it("doğru görünürlük onayında gizli sunucu alanını doldurup formu gönderir", async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    vi.spyOn(window, "prompt").mockReturnValue("PASİFE AL");
    render(<VisibilityExample onSubmit={submit} />);

    await user.selectOptions(screen.getByLabelText("Yayın durumu"), "draft");
    await user.click(screen.getByRole("button", { name: "Kaydet" }));

    expect(submit).toHaveBeenCalledOnce();
    expect(document.querySelector<HTMLInputElement>('input[name="_visibility_confirm"]')).toHaveValue("PASİFE AL");
  });

});
