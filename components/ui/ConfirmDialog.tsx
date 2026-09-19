"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  danger = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
