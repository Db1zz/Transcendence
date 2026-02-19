import React from "react";
import bgLSideBar from "../../img/bg_l_sidebar.png";
import { Contact } from "lucide-react";

interface LeftBarProps {
  onFriendsClick?: () => void;
}

export const LeftBar: React.FC<LeftBarProps> = ({ onFriendsClick }) => {
  return (
    <div className="h-full rounded-l-lg p-4 border border-brand-green relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgLSideBar})` }}
      />
      <div className="absolute inset-0 bg-brand-peach opacity-90" />
      <div className="relative z-10">
        <button
          type="button"
          onClick={onFriendsClick}
          className="w-full flex items-center gap-3 rounded-lg border border-brand-green/70 bg-brand-beige/90 px-3 py-2 text-brand-green font-semibold shadow-sm transition-colors hover:bg-brand-peach hover:border-brand-green"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-peach/60">
            <Contact size={18} className="text-brand-green" />
          </span>
          <span className="text-left">friends list</span>
        </button>
      </div>
    </div>
  );
};

export default LeftBar;
