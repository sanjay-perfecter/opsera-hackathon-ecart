import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

const ViewToggle = ({ view, onChange, className = '' }) => {
  return (
    <div className={`inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 ${className}`}>
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`p-2 rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
          view === 'grid'
            ? 'bg-white shadow-sm text-primary-600'
            : 'text-slate-500 hover:text-slate-700'
        }`}
        title="Grid View"
        aria-label="Grid View"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`p-2 rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
          view === 'list'
            ? 'bg-white shadow-sm text-primary-600'
            : 'text-slate-500 hover:text-slate-700'
        }`}
        title="List View"
        aria-label="List View"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ViewToggle;
