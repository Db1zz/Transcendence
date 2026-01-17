import React, { useState } from "react";
import ReactDOM from "react-dom";
import { X, Expand, Coffee, Shield, Minimize2 } from "lucide-react";
import { User } from "../context/AuthContext";
import { StatusColors } from "./ProfileButton";
import { Button } from "./Button";

interface ProfilePopupProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) {
    return "Unknown";
  }
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

export const ProfilePopup: React.FC<ProfilePopupProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsExpanded(false);
    onClose();
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-roboto">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className={`
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-brand-beige border-2 border-gray-800 rounded-xl overflow-hidden
          duration-300 ease-out flex flex-col
          animate-slide-up
          ${
            isExpanded
              ? "w-[500px] h-[550px] shadow-sharp"
              : "w-[320px] h-[280px] shadow-sharp-md"
          }
        `}
      >
        <div
          className={`
            w-full bg-brand-brick relative transition-all duration-300 shrink-0
            ${isExpanded ? "h-[140px]" : "h-[80px]"}
          `}
        >
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={toggleExpand}
              className="p-1.5 rounded bg-black/20 hover:bg-black/40 transition-colors text-brand-beige"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Expand className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded bg-black/20 hover:bg-black/40 transition-colors text-brand-beige"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="relative px-6 shrink-0">
          <div
            className={`
              absolute border-4 border-brand-beige bg-gray-300 rounded-full 
              transition-all duration-300 shadow-sm group
              ${
                isExpanded
                  ? "-top-16 w-[120px] h-[120px]"
                  : "-top-10 w-[72px] h-[72px]"
              }
            `}
          >
            <img
              src={user.picture}
              alt={user.name}
              className="w-full h-full object-cover rounded-full"
            />
            <div
              className={`
                absolute -bottom-0.5 -right-0.5 rounded-full border-[3px] border-brand-beige
                ${StatusColors[user.status as keyof typeof StatusColors] || "bg-gray-400"}
                ${isExpanded ? "w-8 h-8 -bottom-0.5 -right-0.5" : "w-5 h-5"}
              `}
            />
          </div>
          {user.role === "ADMIN" && (
            <div
              className={`
                absolute flex items-center gap-1 px-2 py-0.5 bg-brand-green text-white
                rounded-md text-xs font-ananias border border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,1)]
                ${isExpanded ? "top-4 right-6" : "top-2 right-6"}
              `}
            >
              <Shield className="w-3 h-3" />
              ADMIN
            </div>
          )}
        </div>
        <div
          className={`
            px-6 pb-6 flex flex-col h-full text-left
            ${isExpanded ? "pt-20" : "pt-12"}
          `}
        >
          <div className="mb-4 shrink-0">
            <h3
              className={`
              font-ananias font-bold text-gray-800 leading-none
              ${isExpanded ? "text-3xl" : "text-xl"}
            `}
            >
              {user.name}
            </h3>
            {isExpanded && (
              <p className="text-sm font-roboto text-gray-500 mt-1">
                {user.name.toLowerCase().replace(/\s/g, "")}
              </p>
            )}
          </div>

          <div className="h-px bg-gray-800/20 mb-4 shrink-0" />
          <div className="mb-4 shrink-0">
            <h4 className="font-ananias text-sm font-bold text-gray-500 mb-2 flex items-center gap-1 uppercase">
              <Coffee className="w-4 h-4" />
              about me
            </h4>
            <p
              className={`
                text-sm text-gray-800 font-roboto
                ${isExpanded ? "" : "line-clamp-2"}
              `}
            >
              {user.about || "This user is too lazy to write a bio."}
            </p>
          </div>
          {isExpanded && (
            <div className="animate-fade-in flex flex-col h-full">
              <div className="mb-auto">
                <h4 className="font-ananias text-sm font-bold text-gray-500 mb-2 uppercase">
                  member since
                </h4>
                <p className="text-sm font-mono text-gray-800">
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div className="flex gap-4 mt-6 justify-end">
                <Button
                  text="add Friend"
                  onClick={() => null}
                  color="bg-transparent"
                  className="!px-6 !py-2 text-gray-800 text-sm w-full"
                />
                <Button
                  text="message"
                  onClick={() => console.log("Message clicked")}
                  className="!px-6 !py-2 text-sm w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ProfilePopup;
