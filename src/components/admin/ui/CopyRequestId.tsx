"use client";
import { useState } from "react";
export default function CopyRequestId({ value }: { value: string }) {
  const [message, setMessage] = useState("");
  return (
    <span>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setMessage("Kopyalandı");
          } catch {
            setMessage("Kopyalanamadı; kodu seçip kopyalayın.");
          }
        }}
      >
        Request ID kopyala
      </button>{" "}
      <small role="status">{message}</small>
    </span>
  );
}
