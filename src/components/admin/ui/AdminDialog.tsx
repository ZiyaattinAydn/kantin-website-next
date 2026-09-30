"use client";
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type ReactElement,
  type CSSProperties,
} from "react";
import { snapshotAdminForm } from "@/lib/admin/form-state";
import styles from "./AdminDialog.module.css";

export default function AdminDialog({
  title,
  children,
  open = false,
  onClose,
  trigger,
  className,
  id,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
  onClose?: () => void;
  trigger?: ReactNode;
  className?: string;
  id?: string;
}) {
  const parts = Children.toArray(children);
  const first =
    !trigger && isValidElement(parts[0]) && parts[0].type === "summary"
      ? (parts.shift() as ReactElement<{
          children: ReactNode;
          className?: string;
          style?: CSSProperties;
        }>)
      : null;
  const [shown, setShown] = useState(open);
  const [visited, setVisited] = useState(open);
  const [confirm, setConfirm] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const baselines = useRef(new Map<HTMLFormElement, string>());
  const heading = useId();
  const dirty = () =>
    Array.from(baselines.current).some(
      ([form, value]) => form.isConnected && snapshotAdminForm(form) !== value,
    );
  function finish() {
    setConfirm(false);
    setShown(false);
    setVisited(false);
    onClose?.();
  }
  function close() {
    if (
      ref.current?.querySelector(
        '[aria-busy="true"],button:disabled[type="submit"]',
      )
    )
      return;
    if (dirty()) setConfirm(true);
    else finish();
  }
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !shown) return;
    const previous = document.activeElement as HTMLElement | null;
    const scroll = window.scrollY;
    const overflow = document.body.style.overflow;
    baselines.current = new Map(
      Array.from(dialog.querySelectorAll<HTMLFormElement>("form")).map(
        (form) => [form, snapshotAdminForm(form)],
      ),
    );
    dialog.showModal();
    document.body.style.overflow = "hidden";
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty()) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", unload);
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      window.removeEventListener("beforeunload", unload);
      previous?.focus({ preventScroll: true });
      window.scrollTo({ top: scroll, behavior: "instant" });
    };
  }, [shown]);
  return (
    <article className={className} id={id}>
      {trigger || first ? (
        <button
          type="button"
          className={first?.props.className ?? styles.trigger}
          style={first?.props.style}
          onClick={() => {
            setVisited(true);
            setShown(true);
          }}
          aria-haspopup="dialog"
        >
          {trigger ?? first?.props.children}
        </button>
      ) : null}
      <dialog
        ref={ref}
        className={styles.dialog}
        aria-labelledby={heading}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === ref.current) {
            const rect = ref.current.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              close();
          }
        }}
      >
        <header className={styles.head}>
          <div>
            <p>YÖNETİM</p>
            <h2 id={heading}>{title}</h2>
          </div>
          <button type="button" onClick={close} aria-label="Düzenlemeyi kapat">
            Kapat ×
          </button>
        </header>
        {confirm ? (
          <section className={styles.confirm} role="alert">
            <strong>Kaydedilmemiş değişiklikleriniz var.</strong>
            <p>
              Değişikliklerinizi kaydedebilir veya düzenlemeye devam
              edebilirsiniz.
            </p>
            <div>
              <button
                type="button"
                onClick={() => {
                  setConfirm(false);
                  const form = Array.from(baselines.current.keys()).find(
                    (form) =>
                      snapshotAdminForm(form) !== baselines.current.get(form),
                  );
                  form?.requestSubmit();
                }}
              >
                Değişiklikleri kaydet
              </button>
              <button
                type="button"
                onClick={() => {
                  for (const form of baselines.current.keys()) form.reset();
                  finish();
                }}
              >
                Kaydetmeden çık
              </button>
              <button type="button" onClick={() => setConfirm(false)}>
                Düzenlemeye devam et
              </button>
            </div>
          </section>
        ) : null}
        <div
          className={styles.body}
          onSubmitCapture={() => {
            try {
              sessionStorage.setItem(
                `admin-scroll:${location.pathname}`,
                String(window.scrollY),
              );
            } catch {}
          }}
        >
          {visited ? parts : null}
        </div>
      </dialog>
    </article>
  );
}
