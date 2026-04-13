import React, { forwardRef, useId } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  hint,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  const reactId = useId();
  const textareaId = props.id || props.name || reactId;
  const errorId = error ? `${textareaId}-error` : undefined;
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:border-transparent outline-none resize-none placeholder:text-slate-400 bg-white ${error
            ? 'border-red-500 focus-visible:ring-red-500'
            : 'border-slate-300 hover:border-slate-400'
          } ${className}`}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
