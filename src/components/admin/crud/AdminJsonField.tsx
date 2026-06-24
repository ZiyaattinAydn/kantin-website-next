"use client";

import { useRef, useState } from "react";
import styles from "./AdminJsonField.module.css";

type JsonState = {
  message: string;
  valid: boolean;
};

function inspectJson(value: string, required: boolean): JsonState {
  if (!value.trim()) {
    return required
      ? { message: "Bu yapılandırma alanı zorunlu.", valid: false }
      : { message: "Boş değer", valid: true };
  }
  try {
    JSON.parse(value);
    return { message: "Alan yapısı geçerli", valid: true };
  } catch {
    return { message: "Alan yapısı geçersiz", valid: false };
  }
}

export default function AdminJsonField({
  defaultValue,
  describedBy,
  id,
  invalid,
  name,
  placeholder,
  required = false,
  rows,
}: {
  defaultValue: string;
  describedBy?: string;
  id: string;
  invalid: boolean;
  name: string;
  placeholder?: string;
  required?: boolean;
  rows: number;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [state, setState] = useState<JsonState>(() => inspectJson(defaultValue, required));

  function validate(value: string): JsonState {
    const result = inspectJson(value, required);
    textarea.current?.setCustomValidity(result.valid ? "" : result.message);
    setState(result);
    return result;
  }

  function formatJson() {
    const element = textarea.current;
    if (!element || !validate(element.value).valid) return;
    element.value = JSON.stringify(JSON.parse(element.value), null, 2);
    validate(element.value);
  }

  return (
    <div className={styles.control}>
      <textarea
        aria-describedby={describedBy}
        aria-invalid={invalid || !state.valid}
        defaultValue={defaultValue}
        id={id}
        name={name}
        onBlur={(event) => validate(event.currentTarget.value)}
        onChange={(event) => validate(event.currentTarget.value)}
        placeholder={placeholder}
        ref={textarea}
        required={required}
        rows={rows}
        spellCheck={false}
      />
      <div className={styles.toolbar}>
        <button onClick={formatJson} type="button">Veriyi düzenle</button>
        <span aria-live="polite" className={state.valid ? styles.valid : styles.invalid}>
          {state.message}
        </span>
      </div>
    </div>
  );
}
