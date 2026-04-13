import React from 'react';

const Table = ({ children, className = '' }) => {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {children}
        </table>
      </div>
    </div>
  );
};

export const THead = ({ children }) => (
  <thead className="bg-slate-50 text-slate-700">
    {children}
  </thead>
);

export const TBody = ({ children }) => (
  <tbody className="divide-y divide-slate-200">
    {children}
  </tbody>
);

export const TH = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${className}`}>
    {children}
  </th>
);

export const TD = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-slate-800 ${className}`}>
    {children}
  </td>
);

export default Table;
