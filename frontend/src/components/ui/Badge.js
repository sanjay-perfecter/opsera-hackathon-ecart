import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    primary: 'bg-primary-100 text-primary-900',
    success: 'bg-accent-100 text-accent-900',
    warning: 'bg-amber-100 text-amber-900',
    danger: 'bg-red-100 text-red-900',
    info: 'bg-sky-100 text-sky-900',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
