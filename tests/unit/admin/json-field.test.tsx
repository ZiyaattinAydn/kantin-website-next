// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import AdminJsonField from "@/components/admin/crud/AdminJsonField";

describe("AdminJsonField", () => {
  it("korumalı gelişmiş veriyi bilinçli açma, doğrulama ve geri alma akışıyla düzenler", async () => {
    const user = userEvent.setup();
    render(
      <AdminJsonField
        defaultValue='{"title":"TEST"}'
        guardMessage="Alan yapısını koru."
        guarded
        id="content"
        invalid={false}
        name="content"
        required
        rows={8}
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("readonly");
    expect(screen.getByText("Düzenleme kilitli")).toBeInTheDocument();
    expect(screen.getByText("Alan yapısını koru.")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Gelişmiş düzenlemeyi aç" }),
    );
    expect(input).not.toHaveAttribute("readonly");

    fireEvent.change(input, { target: { value: "{gecersiz" } });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Veri biçimi geçersiz")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '{"title":"YENI"}' } });
    await user.click(screen.getByRole("button", { name: "Biçimlendir" }));
    expect(input).toHaveValue('{\n  "title": "YENI"\n}');
    expect(input).toHaveAttribute("aria-invalid", "false");

    await user.click(
      screen.getByRole("button", { name: "Kaydedilmiş değere dön" }),
    );
    expect(input).toHaveValue('{"title":"TEST"}');
  });

  it("normal JSON alanında doğrudan düzenlemeye izin verir", () => {
    render(
      <AdminJsonField
        defaultValue="{}"
        id="metadata"
        invalid={false}
        name="metadata"
        rows={4}
      />,
    );

    expect(screen.getByRole("textbox")).not.toHaveAttribute("readonly");
    expect(
      screen.getByRole("button", { name: "Biçimlendir" }),
    ).toBeInTheDocument();
  });
});
