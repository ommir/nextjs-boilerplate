"use client";

import { useEffect, useRef, type RefObject } from "react";
import { Button } from "./Button";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /**
   * Where to send focus if the element that opened the dialog is gone by the
   * time it closes — which is the norm for destructive actions, since
   * confirming often unmounts the row whose button opened this.
   */
  restoreFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Centered confirmation modal. Focus-trapped and closes on Escape while open,
 * restores focus to whatever triggered it on close (DESIGN_SYSTEM.md §9) —
 * the same pattern as `CartDrawer`, adapted for a modal instead of a
 * slide-over (unmounts on close rather than staying `inert`, since there's no
 * exit transition to preserve).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  isConfirming = false,
  onConfirm,
  onCancel,
  restoreFocusRef,
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Callers routinely pass an inline arrow for `onCancel`. Reading it through a
  // ref keeps it out of the effect's deps, so the focus trap isn't torn down
  // and re-armed on every parent render (which would yank focus back to the
  // first control mid-interaction).
  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  });

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Captured at setup rather than read in cleanup: the fallback anchor is a
    // stable node that outlives the dialog, and reading a ref during cleanup is
    // unsafe in the general case.
    const fallbackFocusTarget = restoreFocusRef?.current ?? null;

    function getFocusables(): HTMLElement[] {
      return Array.from(panel!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    }

    getFocusables()[0]?.focus();

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancelRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      // Confirming a destructive action usually unmounts the trigger (e.g. the
      // deleted row's button). Focusing a detached node silently drops focus to
      // <body>, stranding keyboard and screen-reader users at the top of the
      // document — so fall back to a caller-supplied anchor instead.
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      } else if (fallbackFocusTarget?.isConnected) {
        fallbackFocusTarget.focus();
      }
    };
  }, [open, restoreFocusRef]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/25" onClick={onCancel} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          ref={panelRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-pop"
        >
          <h2 id="confirm-dialog-title" className="text-section text-ink">
            {title}
          </h2>
          {description && <p className="mt-1.5 text-body-sm text-ink-secondary">{description}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={isConfirming}>
              {cancelLabel}
            </Button>
            <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} isLoading={isConfirming}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
