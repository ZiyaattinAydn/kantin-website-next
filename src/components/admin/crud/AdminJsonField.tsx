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
      ? { message: "Bu gelişmiş veri alanı zorunlu.", valid: false }
      : { message: "Boş değer", valid: true };
  }
  try {
    JSON.parse(value);
    return { message: "Veri biçimi geçerli", valid: true };
  } catch {
    return { message: "Veri biçimi geçersiz", valid: false };
  }
}

export default function AdminJsonField({
  defaultValue,
  describedBy,
  guarded = false,
  guardMessage,
  id,
  invalid,
  name,
  placeholder,
  required = false,
  rows,
}: {
  defaultValue: string;
  describedBy?: string;
  guarded?: boolean;
  guardMessage?: string;
  id: string;
  invalid: boolean;
  name: string;
  placeholder?: string;
  required?: boolean;
  rows: number;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [editing, setEditing] = useState(!guarded || invalid);
  const [state, setState] = useState<JsonState>(() =>
    inspectJson(defaultValue, required),
  );
  const guardId = guarded ? `${id}-guard` : undefined;
  const ariaDescribedBy =
    [describedBy, guardId].filter(Boolean).join(" ") || undefined;

  function validate(value: string): JsonState {
    const result = inspectJson(value, required);
    textarea.current?.setCustomValidity(result.valid ? "" : result.message);
    setState(result);
    return result;
  }

  function replaceValue(value: string) {
    const element = textarea.current;
    if (!element) return;
    element.value = value;
    validate(value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function formatJson() {
    const element = textarea.current;
    if (!element || !validate(element.value).valid) return;
    replaceValue(JSON.stringify(JSON.parse(element.value), null, 2));
  }

  function resetValue() {
    replaceValue(defaultValue);
  }

  return (
    <div className={`${styles.control} ${guarded ? styles.guarded : ""}`}>
      {guarded ? (
        <div className={styles.guardNotice} id={guardId}>
          <strong>Gelişmiş veri alanı</strong>
          <span>
            {guardMessage ??
              "Yanlış bir alan adı veya yapı değişikliği sitenin ilgili bölümünü bozabilir."}
          </span>
        </div>
      ) : null}
      <textarea
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || !state.valid}
        aria-readonly={!editing || undefined}
        defaultValue={defaultValue}
        id={id}
        name={name}
        onBlur={(event) => validate(event.currentTarget.value)}
        onChange={(event) => validate(event.currentTarget.value)}
        placeholder={placeholder}
        readOnly={!editing}
        ref={textarea}
        required={required}
        rows={rows}
        spellCheck={false}
      />
      <div className={styles.toolbar}>
        <div className={styles.actions}>
          {guarded && !editing ? (
            <button onClick={() => setEditing(true)} type="button">
              Gelişmiş düzenlemeyi aç
            </button>
          ) : (
            <>
              <button onClick={formatJson} type="button">
                Biçimlendir
              </button>
              {guarded ? (
                <button onClick={resetValue} type="button">
                  Kaydedilmiş değere dön
                </button>
              ) : null}
            </>
          )}
        </div>
        <span
          aria-live="polite"
          className={state.valid ? styles.valid : styles.invalid}
        >
          {!editing && guarded ? "Düzenleme kilitli" : state.message}
        </span>
      </div>
    </div>
  );
}
