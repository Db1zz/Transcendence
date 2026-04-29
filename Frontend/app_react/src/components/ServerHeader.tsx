import React from "react";
import { Hash, Bell, Search, Inbox, HelpCircle } from "lucide-react";

interface ServerHeaderProps {
  channelName: string;
}

export const ServerHeader: React.FC<ServerHeaderProps> = ({ channelName }) => {
  return (
    <header className="w-full h-[50px] shrink-0 bg-brand-green flex items-center justify-between px-4 border-b border-brand-peach z-50">
      <div className="flex items-center gap-2 text-brand-beige w-1/3">
        <Hash className="h-5 w-5 opacity-80" />
        <h1 className="font-ananias font-bold text-lg truncate">
          {channelName}
        </h1>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="flex h-8 items-center gap-2 rounded-lg border-2 border-gray-800 bg-brand-beige px-3 w-full max-w-md shadow-sharp-xs focus-within:ring-2 focus-within:ring-brand-brick transition-all">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            placeholder="Search messages..."
            className="w-full bg-transparent text-sm font-roboto text-gray-800 placeholder:text-gray-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 text-brand-beige w-1/3 justify-end">
        <button className="hover:text-brand-brick transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <button className="hover:text-brand-brick transition-colors">
          <Inbox className="h-5 w-5" />
        </button>
        <button className="hover:text-brand-brick transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
