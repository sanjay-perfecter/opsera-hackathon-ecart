import React from 'react';
import Button from './Button';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-700">{icon}</div>}
      {title && <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>}
      {description && <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto leading-6">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
