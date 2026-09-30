// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock("@/lib/admin/theme-actions", () => ({ saveThemeSettings: mocks.save }));
import ThemeSettingsForm from "@/app/admin/(panel)/theme/ThemeSettingsForm";
import {
  DEFAULT_THEME_SETTINGS,
  DEFAULT_SECTION_VISIBILITY,
} from "@/lib/theme/settings";
describe("theme restore review", () => {
  it("reviews an explicit defaults reset before sending the reset intent", async () => {
    const user = userEvent.setup();
    render(
      <ThemeSettingsForm
        initialTheme={{ ...DEFAULT_THEME_SETTINGS, colorPreset: "ocean" }}
        initialVisibility={DEFAULT_SECTION_VISIBILITY}
      />,
    );
    await user.click(
      screen.getByRole("button", {
        name: "Tüm site ayarlarını varsayılana döndür",
      }),
    );
    expect(mocks.save).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Değişiklikleri kontrol edin" }),
    ).toBeInTheDocument();
    expect(document.querySelector('input[name="_intent"]')).toHaveValue(
      "reset",
    );
    await user.click(
      screen.getByRole("button", {
        name: "Tüm site ayarlarını varsayılana döndür",
      }),
    );
    expect(mocks.save).not.toHaveBeenCalled();
    expect(document.querySelector('input[name="_intent"]')).toHaveValue(
      "reset",
    );
    expect(
      screen.getByRole("button", { name: "Onayla ve kaydet" }),
    ).toBeEnabled();
  });
});
