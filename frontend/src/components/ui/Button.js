import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  iconOnly = false,
  title,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-sm',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
    outline: 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-primary-500',
    inverse: 'bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-white focus-visible:ring-offset-slate-900 shadow-sm',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
    'ghost-danger': 'bg-transparent text-red-700 hover:bg-red-50 focus-visible:ring-red-400',
    'ghost-success': 'bg-transparent text-accent-700 hover:bg-accent-50 focus-visible:ring-accent-400',
  };

  // Standard sizes (with text)
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  // Icon-only sizes (square)
  const iconOnlySizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  // Icon sizes based on button size
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const sizeClass = iconOnly ? iconOnlySizes[size] : sizes[size];
  const iconSize = iconSizes[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizeClass} ${className}`}
      title={title}
      aria-label={iconOnly && title ? title : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <svg className={`animate-spin ${children || LeftIcon || RightIcon ? '-ml-0.5 mr-2' : ''} h-4 w-4`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && LeftIcon && (
        <LeftIcon className={`${iconSize} ${children ? 'mr-2' : ''}`} />
      )}
      {children}
      {!loading && RightIcon && (
        <RightIcon className={`${iconSize} ${children ? 'ml-2' : ''}`} />
      )}
    </button>
  );
};

export default Button;
