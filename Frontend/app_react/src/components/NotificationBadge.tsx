import React from "react";
import { useTranslation } from "react-i18next";

interface NotificationBadgeProps {
  count: number;
  children: React.ReactNode;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  children,
  className = "",
}) => {
  const { t } = useTranslation();

  if (count <= 0)
    return <div className={`relative ${className}`}>{children}</div>;

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      <span 
        aria-hidden="true"
        className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg ring-2 ring-[#313338]"
      >
        {count > 99 ? t("notifications.over99", "99+") : count}
      </span>
      <span className="sr-only">
        {t("notifications.unreadCount", { count })}
      </span>
    </div>
  );
};