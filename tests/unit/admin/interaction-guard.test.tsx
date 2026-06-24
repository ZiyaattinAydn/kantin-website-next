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
});
