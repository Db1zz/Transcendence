import React from "react";
import { X, MessageCircle } from "lucide-react";

export interface NotificationPayload {
  user_id: string;
  sender_id: string;
  chat_id: string;
  content: string;
  timestamp: number;
}

interface NotificationToastProps {
  payload: NotificationPayload;
  onClose?: () => void;
  senderName?: string;
  senderPicture?: string;
  onClick?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  payload,
  onClose,
  senderName,
  senderPicture,
  onClick,
}) => {
  const { sender_id, content, timestamp } = payload;

  const timeString = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const avatarSrc =
    senderPicture ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${sender_id}`;

  const displayName = senderName || `User ${sender_id.slice(0, 8)}`;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="
        group pointer-events-auto w-full max-w-sm overflow-hidden
        rounded-2xl border-2 border-gray-800 bg-brand-beige text-gray-800
        shadow-sharp-sm transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-sharp
        focus:outline-none focus:ring-2 focus:ring-brand-brick
      "
    >
      <div className="flex gap-3 p-3">
        <div className="relative shrink-0">
          <img
            src={avatarSrc}
            alt={displayName}
            className="h-11 w-11 rounded-full border-2 border-gray-800 object-cover bg-gray-200"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-brand-beige bg-brand-brick" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-ananias text-sm font-bold uppercase tracking-wide text-gray-800">
                  {displayName}
                </p>
                <span className="shrink-0 rounded-full border border-gray-800/20 bg-brand-green/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                  new
                </span>
              </div>
              <p className="mt-0.5 text-[11px] font-roboto text-gray-500">
                {timeString}
              </p>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                aria-label="Close notification"
                className="
                  rounded-lg border-2 border-transparent p-1 text-gray-500
                  transition-colors hover:border-gray-800 hover:bg-brand-brick hover:text-brand-beige
                "
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-2 flex items-start gap-2">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-brick" />
            <p className="line-clamp-2 break-words font-roboto text-sm leading-5 text-gray-700">
              {content}
            </p>
          </div>
        </div>
      </div>

      <div className="h-1 bg-brand-brick" />
    </div>
  );
};