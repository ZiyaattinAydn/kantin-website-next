"use client";
import { useEffect } from "react";
export default function AdminListState() {
  useEffect(() => {
    const key = `admin-scroll:${location.pathname}`;
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        sessionStorage.removeItem(key);
        requestAnimationFrame(() =>
          window.scrollTo({ top: Number(saved), behavior: "instant" }),
        );
      }
    } catch {}
    const submit = (event: Event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      let field = form.querySelector<HTMLInputElement>(
        'input[name="_return_to"]',
      );
      if (!field) {
        field = document.createElement("input");
        field.type = "hidden";
        field.name = "_return_to";
        form.append(field);
      }
      field.value = location.pathname + location.search;
      try {
        sessionStorage.setItem(key, String(window.scrollY));
      } catch {}
    };
    document.addEventListener("submit", submit, true);
    return () => document.removeEventListener("submit", submit, true);
  });
  return null;
}
