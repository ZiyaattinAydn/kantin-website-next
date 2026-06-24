"use client";

import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage: string;
  confirmPhrase: string;
};

export default function TypedConfirmSubmitButton({
  confirmMessage,
  confirmPhrase,
  ...props
}: Props) {
  return (
    <button
      {...props}
      name="_confirm"
      value={confirmPhrase}
      onClick={(event) => {
        const answer = window.prompt(
          `${confirmMessage}\n\nDevam etmek için tam olarak “${confirmPhrase}” yaz.`,
        );
        if (answer !== confirmPhrase) event.preventDefault();
      }}
    />
  );
}
