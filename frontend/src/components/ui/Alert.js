import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Alert = ({ children, variant = 'info', onClose, className = '' }) => {
  const variants = {
    success: 'bg-accent-50 border-accent-200 text-accent-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-primary-50 border-primary-200 text-primary-900',
  };
  
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[variant] || Info;
  const role = variant === 'error' ? 'alert' : 'status';
  
  return (
    <div role={role} className={`border rounded-lg px-4 py-3 flex items-start gap-3 ${variants[variant]} ${className}`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 text-sm leading-6">{children}</div>
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-1 p-1 rounded-md text-current/80 hover:text-current hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
