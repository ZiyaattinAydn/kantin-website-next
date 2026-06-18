"use client";

import { useEffect } from "react";

export default function AdminBodyClass() {
  useEffect(() => {
    document.body.classList.add("admin-body");
    return () => document.body.classList.remove("admin-body");
  }, []);

  return null;
}
