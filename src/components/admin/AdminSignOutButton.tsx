"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./AdminSignOutButton.module.css";

export default function AdminSignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function signOut() {
    setIsPending(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/admin/login?signedOut=1");
    router.refresh();
  }

  return (
    <button
      className={`admin-text-button ${styles.button}`}
      disabled={isPending}
      onClick={signOut}
      type="button"
    >
      {isPending ? "Çıkış yapılıyor…" : "Çıkış yap"}
    </button>
  );
}
