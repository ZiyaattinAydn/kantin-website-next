import { describe, it, expect } from "vitest";
import {
  editableContentFields,
  applyContentChanges,
  withHeroImage,
} from "@/lib/admin/content-model";
const source = {
  title: ["First", "Second"],
  items: [
    {
      slug: "alsancak",
      title: "Şube",
      image: { src: "/old.jpg", width: 100, height: 100 },
    },
  ],
  seedSource: "private-system",
};
describe("site content structural preservation", () => {
  it("hides technical metadata and preserves topology on changes", () => {
    const f = editableContentFields(source);
    expect(f.some((x) => x.label.includes("seed"))).toBe(false);
    const changes = f.map((x) => ({
      path: x.path,
      value: x.path.at(-1) === 0 ? "Changed" : x.value,
    }));
    const result = applyContentChanges(
      source,
      changes,
      new Map(),
    ) as typeof source;
    expect(result.title).toEqual(["Changed", "Second"]);
    expect(result.items[0].slug).toBe("alsancak");
    expect(result.items[0].image.width).toBe(100);
    expect(result.seedSource).toBe("private-system");
  });
  it("rejects unknown paths, duplicate fields, incorrect types and unsafe links", () => {
    const src = { title: "A", href: "/menu" };
    const f = editableContentFields(src).map((x) => ({
      path: x.path,
      value: x.value,
    }));
    expect(() => applyContentChanges(src, [f[0], f[0]], new Map())).toThrow();
    expect(() =>
      applyContentChanges(
        src,
        [{ path: ["__proto__"], value: "bad" }, f[1]],
        new Map(),
      ),
    ).toThrow();
    expect(() =>
      applyContentChanges(
        src,
        [f[0], { path: ["href"], value: "javascript:alert(1)" }],
        new Map(),
      ),
    ).toThrow();
    expect(() =>
      applyContentChanges(
        src,
        [{ path: ["title"], value: true }, f[1]],
        new Map(),
      ),
    ).toThrow();
  });
  it("resolves only eligible media IDs", () => {
    const src = { image: { src: "/old.jpg", width: 100 } };
    expect(
      applyContentChanges(
        src,
        [{ path: ["image", "src"], value: "media:valid" }],
        new Map([["valid", "/new.jpg"]]),
      ),
    ).toEqual({ image: { src: "/new.jpg", width: 100 } });
    expect(() =>
      applyContentChanges(
        src,
        [{ path: ["image", "src"], value: "media:archived" }],
        new Map(),
      ),
    ).toThrow();
  });
  it("offers an optional hero image without replacing existing fields", () => {
    expect(withHeroImage({ title: ["A", "B"] })).toEqual({
      title: ["A", "B"],
      image: { src: "" },
    });
  });
});
