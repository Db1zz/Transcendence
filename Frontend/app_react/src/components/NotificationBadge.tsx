import React from 'react';

interface NotificationBadgeProps {
  count: number;
  children: React.ReactNode;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  children, 
  className = "" 
}) => {
  if (count <= 0) return <div className={`relative ${className}`}>{children}</div>;

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg ring-2 ring-[#313338]">
        {count > 99 ? '99+' : count}
      </span>
    </div>
  );
};