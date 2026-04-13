import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ items = [], className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1 text-xs text-slate-600">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-1">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-slate-900 font-medium' : ''}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
