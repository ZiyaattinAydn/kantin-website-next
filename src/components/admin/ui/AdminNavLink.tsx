"use client";
import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
function Pending() {
  const { pending } = useLinkStatus();
  return pending ? (
    <small role="status" aria-live="polite">
      {" "}
      · Açılıyor…
    </small>
  ) : null;
}
export default function AdminNavLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link {...props} prefetch={false}>
      {children}
      <Pending />
    </Link>
  );
}
