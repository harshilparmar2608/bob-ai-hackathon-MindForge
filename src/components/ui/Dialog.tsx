import React from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 py-1">
        <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pt-1">
          {message}
        </p>
      </div>
    </Modal>
  );
};
