"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./AdminQuickAccess.module.css";

export default function AdminQuickAccess() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    let supabase: ReturnType<typeof createClient>;

    try {
      supabase = createClient();
    } catch {
      return;
    }

    const checkAccess = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        const userId = authData.user?.id;

        if (authError || !userId) return;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, is_active")
          .eq("id", userId)
          .maybeSingle();

        if (!active || profileError || !profile) return;
        setVisible(profile.role === "admin" && profile.is_active === true);
      } catch {
        if (active) setVisible(false);
      }
    };

    void checkAccess();

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      void checkAccess();
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (!visible) return null;

  return (
    <Link
      aria-label="Admin paneline git"
      className={styles.link}
      href="/admin"
      title="Admin paneline git"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 7h10M18 7h2M4 12h3M11 12h9M4 17h7M15 17h5" />
        <circle cx="16" cy="7" r="2" />
        <circle cx="9" cy="12" r="2" />
        <circle cx="13" cy="17" r="2" />
      </svg>
      <span>Admin paneli</span>
    </Link>
  );
}
