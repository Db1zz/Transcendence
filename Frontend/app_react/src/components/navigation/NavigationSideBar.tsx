"use client";

import React, { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import type { Organization } from "../../hooks/useServers";
import { CreateServerPopup } from "../CreateServerPopup";

interface NavigationSidebarProps {
  onChatClick: () => void;
  onFriendsClick: () => void;
  onServerClick: (serverId: string, serverName: string) => void;
  servers: Organization[];
  onCreateServer: (name: string) => Promise<Organization | void>;
  onJoinServer: (code: string) => Promise<Organization | void>;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  onChatClick,
  onFriendsClick,
  onServerClick,
  servers,
  onCreateServer,
  onJoinServer,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleCreateServer = async (name: string) => {
    const newServer = await onCreateServer(name);
    if (newServer) {
      onServerClick(newServer.id, newServer.name);
    }
  };

  const handleJoinServer = async (code: string) => {
    const joinedServer = await onJoinServer(code);
    if (joinedServer) {
      onServerClick(joinedServer.id, joinedServer.name);
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-hide py-3 space-y-3 bg-brand-peach flex flex-col items-center border-r border-brand-green relative z-20">
        <button
          onClick={onChatClick}
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-brand-beige flex items-center justify-center text-brand-green transition-all duration-200 shadow-sm"
        >
          <MessageSquare size={24} />
        </button>
        <div className="w-8 h-[2px] bg-brand-green/20 rounded-full my-2" />
        {servers.map((server) => (
          <button
            key={server.id}
            onClick={() => onServerClick(server.id, server.name)}
            className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-brand-green text-brand-beige font-bold text-lg flex items-center justify-center transition-all duration-200 shadow-sm overflow-hidden"
            title={server.name}
          >
            {server.iconUrl ? (
              <img
                src={server.iconUrl}
                alt={server.name}
                className="w-full h-full object-cover"
              />
            ) : (
              server.name.charAt(0).toUpperCase()
            )}
          </button>
        ))}
        <button
          onClick={() => setIsPopupOpen(true)}
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-brand-beige flex items-center justify-center text-brand-green transition-all duration-200 shadow-sm border border-dashed border-brand-green hover:bg-brand-green hover:text-brand-beige"
          title="Add a Server"
        >
          <Plus size={24} />
        </button>
      </div>
      <CreateServerPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onCreate={handleCreateServer}
        onJoin={handleJoinServer}
      />
    </>
  );
};
