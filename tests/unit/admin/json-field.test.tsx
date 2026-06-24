// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import AdminJsonField from "@/components/admin/crud/AdminJsonField";

describe("AdminJsonField", () => {
  it("gelişmiş veriyi canlı doğrular ve güvenli biçimde formatlar", async () => {
    const user = userEvent.setup();
    render(
      <AdminJsonField
        defaultValue='{"title":"TEST"}'
        id="content"
        invalid={false}
        name="content"
        required
        rows={8}
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "{gecersiz" } });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Alan yapısı geçersiz")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '{"title":"TEST"}' } });
    await user.click(screen.getByRole("button", { name: "Veriyi düzenle" }));

    expect(input).toHaveValue('{\n  "title": "TEST"\n}');
    expect(input).toHaveAttribute("aria-invalid", "false");
  });
});
