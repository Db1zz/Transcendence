import React, { useState } from "react";
import { ProfilePopup } from "./ProfilePopup";

interface ProfileButtonProps {
  user: any;
  className?: string;
  children?: React.ReactNode;
  disablePopup?: boolean;
  variant?: "default" | "v2";
}

export const StatusColors = {
  online: "bg-green-500",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-gray-400",
};

export const ProfileButton: React.FC<ProfileButtonProps> = ({
  user,
  className = "",
  children,
  disablePopup = false,
  variant = "default",
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const isV2 = variant === "v2";
  const containerStyle = variant === "v2"
    ? "bg-white/40 hover:bg-white/80 border-2 border-transparent hover:border-brand-peach shadow-none transplate-x-0 translate-y-0"
    : "bg-brand-beige border-2 border-gray-800 shadow-sharp-button hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]";
  const avatarStyle = variant === "v2"
    ? "border-2 border-white shadow-sm"
    : "border-2 border-gray-800";

  const handleMainClick = () => {
    if (!disablePopup) {
      setIsPopupOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleMainClick}
        className={`
          flex items-center justify-between gap-3 px-3 py-2
          rounded-lg transition-all duration-150 cursor-pointer
          ${containerStyle}
          ${className}
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className={`w-10 h-10 rounded-full overflow-hidden ${avatarStyle}`}>
              <img
                src={user.picture || user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full
                border-2 ${isV2 ? "border-white" : "border-brand-beige"}
                ${StatusColors[user.status as keyof typeof StatusColors] || "bg-gray-400"}
              `}
            />
          </div>

          <div className="text-left min-w-0">
            <p className="font-ananias font-bold text-gray-800 text-sm truncate">
              {user.name}
            </p>
            <p className={`font-roboto text-xs font-bold uppercase truncate ${isV2 ? "text-gray-500" : "text-brand-brick"}`}>
              {user.status || "offline"}
            </p>
          </div>
        </div>

        {children && (
          <div
            className="flex items-center gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        )}
      </div>

      <ProfilePopup
        user={user}
        friendshipStatus={user?.isFriend}
        canAcceptPending={user?.canAcceptPending}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
};

export default ProfileButton;
