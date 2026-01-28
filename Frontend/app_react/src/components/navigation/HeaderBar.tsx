import React from "react";
import { MessageSquare, Contact, Server } from "lucide-react";

type PageType = "friends" | "messages" | "server";

interface HeaderBarProps {
  type?: PageType;
  serverImage?: string;
}

const getIcon = (type: PageType) => {
  switch (type) {
    case "friends":
      return <Contact size={20} className="text-brand-beige" />;
    case "messages":
      return <MessageSquare size={20} className="text-brand-beige" />;
    case "server":
      return null;
    default:
      return <MessageSquare size={20} className="text-brand-beige" />;
  }
};

export const HeaderBar: React.FC<HeaderBarProps> = ({
  type = "server",
  serverImage,
}) => {
  const icon = getIcon(type);

  return (
    <div className="w-full h-[30px] bg-brand-green flex items-center justify-center sticky top-0 z-50 border-b border-brand-peach gap-3">
      {type === "server" && serverImage ? (
        <img
          src={serverImage}
          alt={type}
          className="w-6 h-6 rounded-full object-cover"
        />
      ) : (
        icon
      )}
      <p className="text-md font-ananas font-bold text-brand-beige">{type}</p>
    </div>
  );
};
