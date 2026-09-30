// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import AdminDialog from "@/components/admin/ui/AdminDialog";
describe("management dialog", () => {
  it("opens in place and offers three choices before discarding a draft", async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    render(
      <AdminDialog title="TEST_Edit" trigger="Düzenle" onClose={close}>
        <form>
          <label>
            Ad
            <input name="name" defaultValue="TEST_old" />
          </label>
          <button type="submit">Kaydet</button>
        </form>
      </AdminDialog>,
    );
    await user.click(screen.getByRole("button", { name: "Düzenle" }));
    await user.type(screen.getByLabelText("Ad"), " changed");
    await user.click(screen.getByRole("button", { name: "Düzenlemeyi kapat" }));
    expect(
      screen.getByText("Kaydedilmemiş değişiklikleriniz var."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Değişiklikleri kaydet" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Düzenlemeye devam et" }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Düzenlemeyi kapat" }));
    await user.click(screen.getByRole("button", { name: "Kaydetmeden çık" }));
    expect(close).toHaveBeenCalledOnce();
  });
  it("Escape uses the same dirty guard", () => {
    render(
      <AdminDialog title="TEST_Edit" open>
        <form>
          <input name="name" defaultValue="TEST_old" />
        </form>
      </AdminDialog>,
    );
    const dialog = screen.getByRole("dialog");
    fireEvent.change(dialog.querySelector("input")!, {
      target: { value: "changed" },
    });
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(
      screen.getByText("Kaydedilmemiş değişiklikleriniz var."),
    ).toBeInTheDocument();
  });
});
