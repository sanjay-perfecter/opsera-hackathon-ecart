import React from 'react';

const Toolbar = ({ left, right, className = '' }) => {
  if (!left && !right) return null;

  return (
    <div className={`mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${className}`}>
      <div className="flex items-center gap-3 flex-wrap">{left}</div>
      <div className="flex items-center gap-2 flex-wrap md:justify-end">{right}</div>
    </div>
  );
};

export default Toolbar;
