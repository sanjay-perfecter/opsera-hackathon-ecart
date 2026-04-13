import React, { forwardRef, useId } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  hint,
  type = 'text', 
  className = '',
  ...props 
}, ref) => {
  const reactId = useId();
  const inputId = props.id || props.name || reactId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:border-transparent outline-none placeholder:text-slate-400 bg-white ${
          error 
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

Input.displayName = 'Input';

export default Input;
