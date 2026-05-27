"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type DialogProps = React.PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  className?: string;
}>;

export function Dialog({ open, onClose, className, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-0 shadow-xl",
        className
      )}
      onClose={onClose}
    >
      {children}
    </dialog>
  );
}
