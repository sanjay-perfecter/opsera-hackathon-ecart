import React, { useEffect, useRef } from 'react';

const ConfirmDialog = ({
  open,
  title = 'Confirm',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onClose,
}) => {
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    cancelRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      // Simple focus trap (Tab cycles between buttons)
      if (e.key === 'Tab') {
        const focusables = [cancelRef.current, confirmRef.current].filter(Boolean);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (prev && prev.focus) prev.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200"
      >
        <div className="p-6">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm text-slate-600 leading-6">{description}</p>
          ) : null}
        </div>
        <div className="px-6 pb-6 flex items-center justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400 px-4 py-2 text-sm"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onConfirm?.()}
            className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 px-4 py-2 text-sm ${
              confirmVariant === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
                : 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
