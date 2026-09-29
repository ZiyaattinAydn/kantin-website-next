// @vitest-environment jsdom
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
const m = vi.hoisted(() => ({
  save: vi.fn(),
  visibility: vi.fn(),
  move: vi.fn(),
  refresh: vi.fn(),
  content: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: m.refresh }),
  usePathname: () => "/admin",
}));
vi.mock("@/lib/admin/menu-actions", () => ({
  saveMenuProduct: m.save,
  setMenuVisibility: m.visibility,
  moveMenuProduct: m.move,
}));
vi.mock("@/lib/admin/content-actions", () => ({
  saveContentRecord: m.content,
}));
vi.mock("@/components/admin/AdminSignOutButton", () => ({
  default: () => <button>Çıkış</button>,
}));
import MenuManager from "@/components/admin/simple/MenuManager";
import MediaPicker from "@/components/admin/simple/MediaPicker";
import ContentEditor from "@/components/admin/simple/ContentEditor";
import AdminShell from "@/components/admin/AdminShell";
import type { MenuData } from "@/lib/admin/menu-model";
const branch = "22222222-2222-4222-8222-222222222222",
  second = "55555555-5555-4555-8555-555555555555",
  category = "33333333-3333-4333-8333-333333333333",
  id = "11111111-1111-4111-8111-111111111111";
const data = {
  branches: [
    { id: branch, slug: "alsancak", name: "Alsancak", sort_order: 0 },
    { id: second, slug: "atakent", name: "Atakent", sort_order: 10 },
  ],
  categories: [
    {
      id: category,
      name: "Fıçı Biralar",
      status: "published",
      is_active: true,
    },
  ],
  categoryBranches: [
    { category_id: category, branch_id: branch, is_active: true },
  ],
  products: [
    {
      id,
      name: "TEST_Efes Pilsen",
      category_id: category,
      status: "published",
      is_active: true,
      updated_at: "2026-09-29T00:00:00Z",
    },
  ],
  placements: [
    {
      id: "44444444-4444-4444-8444-444444444444",
      menu_item_id: id,
      branch_id: branch,
      price_cents: 9500,
      is_active: true,
      sort_order: 0,
      updated_at: "2026-09-29T00:00:00Z",
    },
  ],
  variants: [],
} as unknown as MenuData;
const media = [
  {
    id: "66666666-6666-4666-8666-666666666666",
    label: "TEST_Bira fotoğrafı",
    url: "/test-image.jpg",
    width: 100,
    height: 100,
  },
];
function manager(
  props: Partial<React.ComponentProps<typeof MenuManager>> = {},
) {
  return render(
    <MenuManager
      data={data}
      media={media}
      showNew={false}
      pricesOnly={false}
      {...props}
    />,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, "confirm").mockReturnValue(true);
  m.save.mockResolvedValue({ ok: true, message: "Ürün kaydedildi.", id });
  m.visibility.mockResolvedValue({ ok: true, message: "Ürün gizlendi." });
  m.content.mockResolvedValue({
    ok: true,
    message: "Site içeriği kaydedildi.",
  });
});
describe("simple admin flows", () => {
  it("lets a user change a product price in one form", async () => {
    const user = userEvent.setup();
    manager({ pricesOnly: true });
    await user.click(screen.getByRole("button", { name: "Fiyatı düzenle" }));
    const form = screen.getByRole("region", { name: "Ürünü düzenle" });
    const price = within(form).getByLabelText("Fiyat (TL)");
    await user.clear(price);
    await user.type(price, "215");
    await user.click(
      within(form).getByRole("button", { name: "Ürünü kaydet" }),
    );
    await waitFor(() => expect(m.save).toHaveBeenCalled());
    expect(m.save.mock.calls[0][0]).toMatchObject({
      id,
      branches: [expect.objectContaining({ id: branch, price: "215" })],
    });
    expect(screen.getByRole("status")).toHaveTextContent("Ürün kaydedildi.");
  });
  it("creates a product through branch and portion steps", async () => {
    const user = userEvent.setup();
    manager({ showNew: true });
    await user.type(screen.getByLabelText("Ürün adı"), "TEST_Yeni bira");
    await user.click(screen.getByRole("button", { name: "Devam" }));
    await user.click(screen.getByLabelText("Atakent"));
    await user.click(screen.getByRole("button", { name: "Devam" }));
    const sections = screen.getAllByRole("heading", { level: 4 });
    expect(sections).toHaveLength(2);
    await user.click(
      screen.getAllByRole("button", { name: "+ Seçenek ekle" })[0],
    );
    await user.type(screen.getByLabelText("Boyut / porsiyon"), "TEST_50 cl");
    await user.type(screen.getAllByLabelText("Fiyat (TL)")[1], "215");
    await user.click(screen.getByRole("button", { name: "Devam" }));
    await user.click(screen.getByRole("button", { name: "Ürünü kaydet" }));
    await waitFor(() => expect(m.save).toHaveBeenCalled());
    expect(m.save.mock.calls[0][0].branches).toHaveLength(2);
    expect(m.save.mock.calls[0][0].branches[0].variants[0]).toMatchObject({
      label: "TEST_50 cl",
      price: "215",
    });
  });
  it("confirms branch-specific hiding and supports branch selection", async () => {
    const user = userEvent.setup();
    manager();
    await user.click(screen.getByRole("button", { name: "Gizle" }));
    await waitFor(() =>
      expect(m.visibility).toHaveBeenCalledWith(
        id,
        branch,
        false,
        "2026-09-29T00:00:00Z",
        "EVET",
      ),
    );
    await user.click(screen.getByRole("button", { name: "ATAKENT" }));
    expect(
      screen.getByText(/Bu şubede henüz kategori yok/),
    ).toBeInTheDocument();
  });
  it("selects media by human-readable names", async () => {
    const user = userEvent.setup(),
      onChange = vi.fn();
    render(<MediaPicker choices={media} value="" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Görsel değiştir" }));
    await user.click(
      screen.getByRole("button", { name: "TEST_Bira fotoğrafı" }),
    );
    expect(onChange).toHaveBeenCalledWith(media[0].id);
    expect(screen.queryByText(media[0].id)).not.toBeInTheDocument();
  });
  it("saves content fields with the existing record version", async () => {
    const user = userEvent.setup();
    render(
      <ContentEditor
        media={media}
        record={{
          id,
          table: "content_blocks",
          label: "Ana başlık",
          updated_at: "v1",
          revisionHref: "/admin/manage/content-blocks",
          fields: [
            {
              path: ["description"],
              label: "Alt açıklama",
              value: "Önceki",
              kind: "textarea",
            },
          ],
        }}
      />,
    );
    await user.click(screen.getByText("Ana başlık"));
    const field = screen.getByLabelText("Alt açıklama");
    await user.clear(field);
    await user.type(field, "Yeni açıklama");
    await user.click(
      screen.getByRole("button", { name: "Değişiklikleri kaydet" }),
    );
    await waitFor(() =>
      expect(m.content).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: "v1",
          changes: [{ path: ["description"], value: "Yeni açıklama" }],
        }),
      ),
    );
  });
  it("keeps technical navigation collapsed and closes mobile menu with Escape", async () => {
    const user = userEvent.setup();
    render(
      <AdminShell identity="TEST_admin">
        <p>Content</p>
      </AdminShell>,
    );
    const advanced = screen.getByText("Gelişmiş Yönetim").closest("details");
    expect(advanced).not.toHaveAttribute("open");
    expect(
      screen
        .getByRole("link", { name: "Varyant kayıtları" })
        .closest("details"),
    ).toBe(advanced);
    await user.click(
      screen.getByRole("button", { name: "Yönetim menüsünü aç" }),
    );
    expect(document.body.style.overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    expect(document.body.style.overflow).toBe("");
    await user.click(screen.getByText("Gelişmiş Yönetim"));
    expect(
      screen.getByRole("link", { name: "Sistem Kayıtları / Teknik Loglar" }),
    ).toBeInTheDocument();
  });
});
