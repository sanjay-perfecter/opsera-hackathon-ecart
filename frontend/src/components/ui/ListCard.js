import React from 'react';

const ListCard = ({ 
  children,
  image,
  icon: Icon,
  iconBg = 'bg-slate-100',
  iconColor = 'text-slate-700',
  title,
  subtitle,
  badge,
  metadata = [],
  actions,
  isDeleted = false,
  className = '',
  onClick,
  variant = 'grid' // 'grid' or 'list'
}) => {
  // List View (horizontal row layout)
  if (variant === 'list') {
    return (
      <div 
        className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-shadow duration-150 hover:shadow-md ${isDeleted ? 'opacity-60' : ''} ${className}`}
        onClick={onClick}
      >
        <div className="flex items-center p-4 gap-4">
          {/* Icon/Image Area */}
          {(image || Icon) && (
            <div className="flex-shrink-0">
              {image ? (
                <img 
                  src={image} 
                  alt={title || 'Item'} 
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=No+Image'; }}
                />
              ) : Icon ? (
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
              ) : null}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {title && (
                <h3 className="text-sm font-semibold text-slate-900 truncate">{title}</h3>
              )}
              {badge && (
                <div className="flex-shrink-0">
                  {badge}
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate mb-1">{subtitle}</p>
            )}
            {/* Metadata in horizontal layout */}
            {metadata.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {metadata.map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-sm">
                    {item.icon && (
                      <item.icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    )}
                    {item.label && (
                      <span className="text-slate-500">{item.label}:</span>
                    )}
                    <span className={`${item.className || 'text-gray-700'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {children}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex-shrink-0 flex items-center gap-1">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid View (vertical card layout - default)
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-shadow duration-150 hover:shadow-md ${isDeleted ? 'opacity-60' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Icon/Image Area */}
      {(image || Icon) && (
        <div className="p-4 flex justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100 min-h-[100px]">
          {image ? (
            <img 
              src={image} 
              alt={title || 'Item'} 
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image'; }}
            />
          ) : Icon ? (
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${iconBg}`}>
              <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
          ) : null}
        </div>
      )}

      {/* Content Area */}
      <div className="p-4">
        {/* Title Row */}
        {(title || badge) && (
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-sm font-semibold text-slate-900 truncate">{title}</h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 truncate">{subtitle}</p>
              )}
            </div>
            {badge && (
              <div className="flex-shrink-0">
                {badge}
              </div>
            )}
          </div>
        )}

        {/* Metadata Rows */}
        {metadata.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {item.icon && (
                  <item.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
                {item.label && (
                  <span className="text-slate-500">{item.label}:</span>
                )}
                <span className={`truncate ${item.className || 'text-slate-700'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Custom Children */}
        {children}

        {/* Actions Row */}
        {actions && (
          <div className="flex justify-center gap-1 pt-3 mt-3 border-t border-slate-200">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListCard;
