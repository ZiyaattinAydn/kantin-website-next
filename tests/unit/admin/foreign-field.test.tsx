// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AdminForeignField from "@/components/admin/crud/AdminForeignField";

const options = Array.from({ length: 320 }, (_, index) => ({
  value: `TEST_${index}`,
  label: `TEST_ Ürün ${index}`,
}));

describe("AdminForeignField", () => {
  it("200. kaydın sonrasındaki ilişkiyi arayıp gerçek kimliği forma yazar", async () => {
    const user = userEvent.setup();
    const submitted = vi.fn();

    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted(new FormData(event.currentTarget).get("menu_item_id"));
        }}
      >
        <AdminForeignField
          defaultValue=""
          id="menu-item"
          name="menu_item_id"
          options={options}
          required
        />
        <button type="submit">Kaydet</button>
      </form>,
    );

    const search = screen.getByRole("combobox");
    await user.type(search, "TEST_ Ürün 319");
    await user.click(screen.getByRole("option", { name: "TEST_ Ürün 319" }));
    await user.click(screen.getByRole("button", { name: "Kaydet" }));

    expect(submitted).toHaveBeenCalledWith("TEST_319");
    expect(search).toHaveValue("TEST_ Ürün 319");
  });

  it("zorunlu ilişkide listeden seçim yapılmadan formu göndermez", async () => {
    const user = userEvent.setup();
    const submitted = vi.fn();

    render(
      <form onSubmit={submitted}>
        <AdminForeignField
          defaultValue=""
          id="category"
          name="category_id"
          options={options}
          required
        />
        <button type="submit">Kaydet</button>
      </form>,
    );

    await user.type(screen.getByRole("combobox"), "listede olmayan değer");
    await user.click(screen.getByRole("button", { name: "Kaydet" }));

    expect(submitted).not.toHaveBeenCalled();
    expect(screen.getByText("Listeden geçerli bir seçim yap.")).toBeInTheDocument();
  });
});
