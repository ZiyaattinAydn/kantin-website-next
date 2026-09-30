"use client";

import { useEffect, useState } from "react";
import {
  requiredAdminVisibilityConfirmation,
  type AdminVisibilityConfirmation,
} from "@/lib/admin/visibility";
import styles from "./AdminInteractionGuard.module.css";
import AdminDialog from "./ui/AdminDialog";
import { snapshotAdminForm } from "@/lib/admin/form-state";
export { snapshotAdminForm } from "@/lib/admin/form-state";

const GUARDED_FORM_SELECTOR = 'form[data-admin-dirty-guard="true"]';
const ACCORDION_ITEM_SELECTOR = 'details[data-admin-accordion-item="true"]';
const DEFAULT_MESSAGE =
  "Kaydedilmemiş değişiklikleriniz var. Kaydedebilir, kaydetmeden çıkabilir veya düzenlemeye devam edebilirsiniz.";

function booleanDataset(value: string | undefined, fallback: boolean): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function namedControl(form: HTMLFormElement, name: string): Element | null {
  if (!name) return null;
  const control = form.elements.namedItem(name);
  return control instanceof Element ? control : null;
}

function nextActiveValue(
  form: HTMLFormElement,
  field: string,
  fallback: boolean,
): boolean {
  const control = namedControl(form, field);
  return control instanceof HTMLInputElement && control.type === "checkbox"
    ? control.checked
    : fallback;
}

function nextStatusValue(
  form: HTMLFormElement,
  field: string,
  fallback: string,
): string {
  const control = namedControl(form, field);
  return control instanceof HTMLSelectElement ||
    control instanceof HTMLInputElement
    ? control.value
    : fallback;
}

export function visibilityConfirmationForForm(
  form: HTMLFormElement,
): AdminVisibilityConfirmation | null {
  if (form.dataset.adminVisibilityGuard !== "true") return null;

  const activeField = form.dataset.activeField ?? "";
  const statusField = form.dataset.statusField ?? "";
  const hasActiveField = Boolean(activeField);
  const hasStatusField = Boolean(statusField);
  const currentActive = booleanDataset(form.dataset.currentActive, true);
  const currentStatus = form.dataset.currentStatus ?? "";

  const eventDate = (name: string) => {
    const raw = nextStatusValue(form, name, "");
    return raw ? `${raw.length === 16 ? raw + ":00" : raw}+03:00` : null;
  };
  const event = (current: boolean) =>
    form.dataset.eventState
      ? current
        ? JSON.parse(form.dataset.eventState)
        : {
            contentType: nextStatusValue(form, "content_type", "event"),
            startAt: eventDate("start_at"),
            endAt: eventDate("end_at"),
            publishStartAt: eventDate("publish_start_at"),
            publishEndAt: eventDate("publish_end_at"),
            publishedAt: eventDate("published_at"),
          }
      : undefined;
  const base = requiredAdminVisibilityConfirmation({
    isCreate: form.dataset.isNew === "true",
    current: {
      hasActiveField,
      hasStatusField,
      active: currentActive,
      status: currentStatus,
      event: event(true),
    },
    next: {
      hasActiveField,
      hasStatusField,
      active: nextActiveValue(form, activeField, currentActive),
      status: nextStatusValue(form, statusField, currentStatus),
      event: event(false),
    },
  });
  if (base) return base;
  if (
    form.dataset.currentEventBranches &&
    form.dataset.isNew !== "true" &&
    nextStatusValue(form, statusField, currentStatus) === "published" &&
    nextActiveValue(form, activeField, currentActive)
  ) {
    const current = JSON.parse(form.dataset.currentEventBranches) as string[];
    const next = Array.from(
      form.querySelectorAll<HTMLInputElement>(
        'input[name="_event_branch"]:checked',
      ),
    ).map((input) => input.value);
    if (next.some((id) => !current.includes(id))) return "YAYINLA";
    if (current.some((id) => !next.includes(id))) return "PASİFE AL";
  }
  return null;
}

function visibilityPrompt(
  form: HTMLFormElement,
  phrase: AdminVisibilityConfirmation,
): string {
  const recordLabel = form.dataset.recordLabel || "Bu kayıt";
  const impact =
    form.dataset.visibilityImpact ||
    "Bu değişiklik ziyaretçi görünürlüğünü etkiler.";
  const action =
    phrase === "YAYINLA"
      ? "ziyaretçilere açılacak"
      : "ziyaretçilerden gizlenecek";

  return `${recordLabel} ${action}.\n\n${impact}\n\nDevam etmek için tam olarak “${phrase}” yaz.`;
}

function visibilityConfirmationInput(
  form: HTMLFormElement,
): HTMLInputElement | null {
  const control = form.elements.namedItem("_visibility_confirm");
  return control instanceof HTMLInputElement ? control : null;
}

function guardedForms(root: HTMLElement): HTMLFormElement[] {
  return Array.from(
    root.querySelectorAll<HTMLFormElement>(GUARDED_FORM_SELECTOR),
  );
}

export default function AdminInteractionGuard({
  rootId,
  confirmMessage = DEFAULT_MESSAGE,
}: {
  rootId: string;
  confirmMessage?: string;
}) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [leavePrompt, setLeavePrompt] = useState<{
    save: () => void;
    discard: () => void;
  } | null>(null);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const baselines = new WeakMap<HTMLFormElement, string>();
    let submitting = false;

    const forms = guardedForms(root);
    for (const form of forms) baselines.set(form, snapshotAdminForm(form));

    const initiallyOpen = Array.from(
      root.querySelectorAll<HTMLDetailsElement>(
        `${ACCORDION_ITEM_SELECTOR}[open]`,
      ),
    );
    for (const item of initiallyOpen.slice(0, -1)) item.open = false;

    const isDirty = (form: HTMLFormElement) =>
      snapshotAdminForm(form) !==
      (baselines.get(form) ?? snapshotAdminForm(form));

    const dirtyForms = (scope: ParentNode = root) =>
      Array.from(
        scope.querySelectorAll<HTMLFormElement>(GUARDED_FORM_SELECTOR),
      ).filter(isDirty);

    const refreshDirtyState = () => {
      const dirty = dirtyForms().length > 0;
      root.toggleAttribute("data-has-unsaved-changes", dirty);
      setHasUnsavedChanges(dirty);
      return dirty;
    };

    const discardForms = (items: HTMLFormElement[]) => {
      for (const form of items) form.reset();
      root.removeAttribute("data-has-unsaved-changes");
      setHasUnsavedChanges(false);
      window.setTimeout(() => {
        for (const form of items) baselines.set(form, snapshotAdminForm(form));
        refreshDirtyState();
      }, 0);
    };

    const confirmDiscard = (items: HTMLFormElement[], proceed: () => void) => {
      if (!items.length) return true;
      setLeavePrompt({
        save: () => {
          setLeavePrompt(null);
          items[0]?.requestSubmit();
        },
        discard: () => {
          discardForms(items);
          setLeavePrompt(null);
          proceed();
        },
      });
      return false;
    };

    const handleInput = (event: Event) => {
      const target = event.target;
      if (target instanceof Element) {
        const form = target.closest<HTMLFormElement>(GUARDED_FORM_SELECTOR);
        const confirmation = form ? visibilityConfirmationInput(form) : null;
        if (confirmation) confirmation.value = "";
      }
      refreshDirtyState();
    };

    const handleReset = (event: Event) => {
      const form = event.target;
      if (
        !(form instanceof HTMLFormElement) ||
        !form.matches(GUARDED_FORM_SELECTOR)
      )
        return;
      window.setTimeout(() => {
        baselines.set(form, snapshotAdminForm(form));
        refreshDirtyState();
      }, 0);
    };

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      if (form.matches(GUARDED_FORM_SELECTOR)) {
        const requiredPhrase = visibilityConfirmationForForm(form);
        const confirmationInput = visibilityConfirmationInput(form);

        if (requiredPhrase) {
          const answer = window.prompt(visibilityPrompt(form, requiredPhrase));
          if (answer !== requiredPhrase) {
            if (confirmationInput) confirmationInput.value = "";
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          if (confirmationInput) confirmationInput.value = requiredPhrase;
        } else if (confirmationInput) {
          confirmationInput.value = "";
        }

        submitting = true;
        baselines.set(form, snapshotAdminForm(form));
        refreshDirtyState();
        return;
      }

      const pending = dirtyForms();
      if (
        !confirmDiscard(pending, () => {
          submitting = true;
          form.requestSubmit(
            event.submitter instanceof HTMLButtonElement
              ? event.submitter
              : undefined,
          );
        })
      ) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      submitting = true;
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const summary = target.closest("summary");
      const details = summary?.parentElement;
      if (
        summary &&
        details instanceof HTMLDetailsElement &&
        details.matches(ACCORDION_ITEM_SELECTOR)
      ) {
        event.preventDefault();
        const currentDirty = dirtyForms(details);

        if (details.open) {
          if (
            !confirmDiscard(currentDirty, () => {
              details.open = false;
            })
          )
            return;
          details.open = false;
          return;
        }

        const openedSiblings = Array.from(
          root.querySelectorAll<HTMLDetailsElement>(
            `${ACCORDION_ITEM_SELECTOR}[open]`,
          ),
        ).filter((item) => item !== details);
        const siblingDirty = openedSiblings.flatMap((item) => dirtyForms(item));
        if (
          !confirmDiscard(siblingDirty, () => {
            for (const item of openedSiblings) item.open = false;
            details.open = true;
          })
        )
          return;
        for (const item of openedSiblings) item.open = false;
        details.open = true;
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#")) return;

      if (
        !confirmDiscard(dirtyForms(), () => {
          submitting = true;
          window.location.assign(anchor.href);
        })
      ) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        submitting = true;
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (submitting || !refreshDirtyState()) return;
      event.preventDefault();
      event.returnValue = "";
    };

    const handlePopState = () => {
      if (submitting || !refreshDirtyState()) return;
      if (window.confirm(confirmMessage)) {
        discardForms(dirtyForms());
        submitting = true;
        return;
      }
      window.history.forward();
    };

    const observer = new MutationObserver(() => {
      for (const form of guardedForms(root))
        if (!baselines.has(form)) baselines.set(form, snapshotAdminForm(form));
    });
    observer.observe(root, { childList: true, subtree: true });
    root.addEventListener("input", handleInput);
    root.addEventListener("change", handleInput);
    root.addEventListener("reset", handleReset);
    root.addEventListener("submit", handleSubmit, true);
    root.addEventListener("click", handleClick, true);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    refreshDirtyState();

    return () => {
      observer.disconnect();
      root.removeEventListener("input", handleInput);
      root.removeEventListener("change", handleInput);
      root.removeEventListener("reset", handleReset);
      root.removeEventListener("submit", handleSubmit, true);
      root.removeEventListener("click", handleClick, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      root.removeAttribute("data-has-unsaved-changes");
    };
  }, [confirmMessage, rootId]);

  return (
    <>
      {leavePrompt ? (
        <AdminDialog
          title="Kaydedilmemiş değişiklikler"
          open
          onClose={() => setLeavePrompt(null)}
        >
          <p>{confirmMessage}</p>
          <div className={styles.choices}>
            <button type="button" onClick={leavePrompt.save}>
              Değişiklikleri kaydet
            </button>
            <button type="button" onClick={leavePrompt.discard}>
              Kaydetmeden çık
            </button>
            <button type="button" onClick={() => setLeavePrompt(null)}>
              Düzenlemeye devam et
            </button>
          </div>
        </AdminDialog>
      ) : null}
      {hasUnsavedChanges ? (
        <aside
          aria-live="polite"
          className={styles.unsavedNotice}
          role="status"
        >
          <strong>Kaydedilmemiş değişiklikler var</strong>
          <span>
            Başka bir kayda veya sayfaya geçmeden önce değişikliklerini kaydet.
          </span>
        </aside>
      ) : null}
    </>
  );
}
