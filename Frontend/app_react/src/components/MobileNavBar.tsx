import React from "react";
import { Home, Bell, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const StatusColors: Record<string, string> = {
  online: "bg-green-500",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-gray-400",
};
interface MobileNavBarProps {
  active?:
    | "friends"
    | "chat"
    | "voice"
    | "server"
    | "friendsList"
    | "notifications";
  onNavigate?: (
    view:
      | "friends"
      | "chat"
      | "voice"
      | "server"
      | "friendsList"
      | "notifications",
  ) => void;
  onMainClick?: () => void;
  onYouClick?: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  active = "friends",
  onNavigate,
  onMainClick,
  onYouClick,
}) => {
  const { user } = useAuth();

  const handleMain = () => {
    if (onMainClick) {
      onMainClick();
      return;
    }
    onNavigate?.("chat");
  };
  const handleFriends = () => onNavigate?.("friendsList");
  const handleNotifications = () => onNavigate?.("notifications");
  const handleYou = () => {
    if (onYouClick) {
      onYouClick();
      return;
    }
    onNavigate?.("server");
  };

  const status = user?.status || "offline";

  const btnBase =
    "flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors";
  const mainActive = active === "chat";
  const friendsActive = active === "friendsList";
  const notifActive = active === "notifications";
  const youActive = active === "server";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-3 mb-3 rounded-xl shadow-lg flex items-center gap-3 px-3 py-2 bg-brand-green border border-brand-peach">
        <button
          onClick={handleMain}
          className={`${btnBase} ${mainActive ? "bg-brand-brick text-brand-beige" : "text-brand-beige hover:bg-white/5"}`}
          aria-label="Main"
        >
          <Home
            size={20}
            className={`${mainActive ? "text-brand-beige" : "text-brand-beige"}`}
          />
          <span className="text-[10px]">main</span>
        </button>

        <button
          onClick={handleFriends}
          className={`${btnBase} ${friendsActive ? "bg-brand-brick text-brand-beige" : "text-brand-beige hover:bg-white/5"}`}
          aria-label="Friends"
        >
          <Users
            size={20}
            className={`${friendsActive ? "text-brand-beige" : "text-brand-beige"}`}
          />
          <span className="text-[10px]">friends</span>
        </button>

        <button
          onClick={handleNotifications}
          className={`${btnBase} ${notifActive ? "bg-brand-brick text-brand-beige" : "text-brand-beige hover:bg-white/5"}`}
          aria-label="Notifications"
        >
          <Bell
            size={20}
            className={`${notifActive ? "text-brand-beige" : "text-brand-beige"}`}
          />
          <span className="text-[10px]">notifications</span>
        </button>

        <button
          onClick={handleYou}
          className={`${btnBase} ${youActive ? "bg-brand-brick text-brand-beige" : "text-brand-beige hover:bg-white/5"}`}
          aria-label="You"
        >
          <div className="relative">
            <div
              className={`w-8 h-8 rounded-full overflow-hidden border-2 ${youActive ? "border-brand-beige" : "border-gray-800"}`}
            >
              <img
                src={user?.picture}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                StatusColors[status as keyof typeof StatusColors] ||
                "bg-gray-400"
              }`}
            />
          </div>
          <span className="text-[10px]">you</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavBar;
