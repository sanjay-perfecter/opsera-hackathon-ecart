import React from 'react';

const Card = ({ children, className = '', hover = false, padding = true, variant = 'default' }) => {
  const variants = {
    default: 'bg-white border-slate-200',
    subtle: 'bg-slate-50 border-slate-200',
  };

  return (
    <div 
      className={`rounded-xl shadow-sm border ${variants[variant] || variants.default} ${
        hover ? 'transition-shadow duration-150 hover:shadow-md' : ''
      } ${padding ? 'p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
