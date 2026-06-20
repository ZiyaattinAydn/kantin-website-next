"use client";

import type { ButtonHTMLAttributes } from "react";

export default function ConfirmSubmitButton({
  confirmMessage,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { confirmMessage: string }) {
  return (
    <button
      {...props}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    />
  );
}
