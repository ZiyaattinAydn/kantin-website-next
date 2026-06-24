"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { AdminOption } from "@/lib/admin/options";
import styles from "./AdminResourceEditor.module.css";

const VISIBLE_RESULT_LIMIT = 50;

function normalise(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function AdminForeignField({
  id,
  name,
  options,
  defaultValue,
  required,
  nullable,
  invalid,
  describedBy,
  placeholder,
}: {
  id: string;
  name: string;
  options: readonly AdminOption[];
  defaultValue: string;
  required?: boolean;
  nullable?: boolean;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
}) {
  const selectedAtStart = options.find((option) => option.value === defaultValue);
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [query, setQuery] = useState(
    selectedAtStart?.label ?? (defaultValue ? `Mevcut seçim · ${defaultValue}` : ""),
  );
  const [open, setOpen] = useState(false);
  const [selectionError, setSelectionError] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue],
  );

  const filteredOptions = useMemo(() => {
    const search = normalise(query);
    if (!search || selectedOption?.label === query) return options;

    return options.filter((option) => normalise(option.label).includes(search));
  }, [options, query, selectedOption]);

  const visibleOptions = filteredOptions.slice(0, VISIBLE_RESULT_LIMIT);
  const listId = `${id}-options`;
  const hasError = Boolean(invalid || selectionError);

  useEffect(() => {
    searchRef.current?.setCustomValidity(
      required && !selectedValue ? "Listeden geçerli bir seçim yap." : "",
    );
  }, [required, selectedValue]);

  function selectOption(option: AdminOption) {
    setSelectedValue(option.value);
    setQuery(option.label);
    setSelectionError(false);
    setOpen(false);
    searchRef.current?.focus();
  }

  function clearSelection() {
    setSelectedValue("");
    setQuery("");
    setSelectionError(false);
    setOpen(true);
    searchRef.current?.focus();
  }

  function handleInput(event: FormEvent<HTMLInputElement>) {
    const nextQuery = event.currentTarget.value;
    setQuery(nextQuery);
    setOpen(true);
    setSelectionError(false);

    if (selectedOption?.label !== nextQuery) {
      setSelectedValue("");
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "Enter" && open && visibleOptions.length === 1) {
      event.preventDefault();
      selectOption(visibleOptions[0]);
    }
  }

  return (
    <div
      className={styles.foreignField}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <input name={name} type="hidden" value={selectedValue} />
      <div className={styles.foreignSearchRow}>
        <input
          aria-autocomplete="list"
          aria-controls={listId}
          aria-describedby={describedBy}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-invalid={hasError}
          autoComplete="off"
          id={id}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          onInvalid={() => {
            setSelectionError(true);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Yazarak ara ve seç"}
          ref={searchRef}
          required={required}
          role="combobox"
          type="search"
          value={query}
        />
        {(nullable || !required) && selectedValue ? (
          <button
            aria-label="Seçimi temizle"
            className={styles.foreignClear}
            onClick={clearSelection}
            type="button"
          >
            ×
          </button>
        ) : null}
      </div>

      {open ? (
        <div className={styles.foreignMenu} id={listId} role="listbox">
          {visibleOptions.map((option) => (
            <button
              aria-selected={option.value === selectedValue}
              className={styles.foreignOption}
              key={option.value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
              role="option"
              type="button"
            >
              <span>{option.label}</span>
              {option.value === selectedValue ? <b>Seçili</b> : null}
            </button>
          ))}

          {!visibleOptions.length ? (
            <p className={styles.foreignEmpty}>Bu aramayla eşleşen kayıt bulunamadı.</p>
          ) : null}

          {filteredOptions.length > VISIBLE_RESULT_LIMIT ? (
            <p className={styles.foreignHint}>
              {filteredOptions.length} sonuç bulundu. Daha dar bir arama yazarak listeyi küçült.
            </p>
          ) : null}
        </div>
      ) : null}

      {selectionError ? (
        <small className={styles.fieldError}>Listeden geçerli bir seçim yap.</small>
      ) : null}
    </div>
  );
}
