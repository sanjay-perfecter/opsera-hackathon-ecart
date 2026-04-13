import React from 'react';

const PageHeader = ({ title, description, actions, children, className = '' }) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {title && (
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-600 leading-6">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            {actions}
          </div>
        )}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
};

export default PageHeader;
