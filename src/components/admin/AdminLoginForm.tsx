"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./AdminLoginForm.module.css";

type Props = {
  nextPath: string;
  initialMessage?: string;
  initialMessageIsError?: boolean;
};

function safeAdminPath(value: string) {
  return value.startsWith("/admin") && !value.startsWith("//")
    ? value
    : "/admin";
}

export default function AdminLoginForm({
  nextPath,
  initialMessage,
  initialMessageIsError = false,
}: Props) {
  const router = useRouter();
  const [message, setMessage] = useState(initialMessage ?? "");
  const [isError, setIsError] = useState(initialMessageIsError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setIsError(false);
    setMessage("Giriş yapılıyor…");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setIsSubmitting(false);
      setIsError(true);
      setMessage("Giriş başarısız. E-posta veya şifreyi kontrol et.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || !profile || !profile.is_active || profile.role !== "admin") {
      await supabase.auth.signOut({ scope: "local" });
      setIsSubmitting(false);
      setIsError(true);
      setMessage("Bu hesap yönetici paneline erişim yetkisine sahip değil.");
      return;
    }

    setMessage("Giriş başarılı, yönlendiriliyorsun…");
    router.replace(safeAdminPath(nextPath));
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        E-posta
        <input
          className={styles.input}
          autoComplete="username"
          inputMode="email"
          name="email"
          required
          type="email"
        />
      </label>

      <label className={styles.field}>
        Şifre
        <input
          className={styles.input}
          autoComplete="current-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>

      <button
        className={`button button-primary ${styles.submit}`}
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>

      <p
        aria-live="polite"
        className={`${styles.message} ${isError ? styles.error : ""}`}
        role={isError ? "alert" : "status"}
      >
        {message}
      </p>

      <p className={styles.help}>
        Yalnızca işletme tarafından yetkilendirilmiş aktif yönetici hesapları oturum açabilir.
      </p>
    </form>
  );
}
