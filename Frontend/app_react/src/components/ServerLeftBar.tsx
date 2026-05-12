import React, { useState } from "react";
import { ChevronDown, ChevronRight, Hash, Volume2, Plus } from "lucide-react";
import bgLSideBar from "../img/bg_l_sidebar.png";

export type ChannelType = "text" | "voice";
export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  unread?: boolean;
}
export interface ChannelCategory {
  id: string;
  name: string;
  channels: Channel[];
}

interface ServerLeftBarProps {
  serverName: string;
  categories: ChannelCategory[];
  activeChannelId: string;
  onSelectChannel: (channel: Channel) => void;
}

export const ServerLeftBar: React.FC<ServerLeftBarProps> = ({
  serverName,
  categories,
  activeChannelId,
  onSelectChannel,
}) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div className="h-full rounded-l-lg border border-brand-green relative overflow-hidden flex flex-col pb-16">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgLSideBar})` }}
      />
      <div className="absolute inset-0 bg-brand-peach opacity-90" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex h-12 shrink-0 items-center justify-between border-b-2 border-gray-800 bg-brand-brick px-4 text-brand-beige shadow-sm cursor-pointer hover:bg-brand-brick/90">
          <h2 className="truncate font-ananias text-base font-bold uppercase">
            {serverName}
          </h2>
          <ChevronDown className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-2 py-3 scrollbar-hide">
          {categories.map((cat) => {
            const isCollapsed = collapsed[cat.id];
            return (
              <div key={cat.id}>
                <button
                  onClick={() => toggle(cat.id)}
                  className="group flex w-full items-center gap-1 px-1 py-1 text-xs font-ananias font-bold uppercase tracking-wider text-gray-800/70 hover:text-gray-900"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  <span className="flex-1 text-left">{cat.name}</span>
                  <Plus className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                {!isCollapsed && (
                  <div className="mt-1 space-y-1">
                    {cat.channels.map((ch) => {
                      const isActive = ch.id === activeChannelId;
                      const Icon = ch.type === "voice" ? Volume2 : Hash;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => onSelectChannel(ch)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-roboto font-medium transition-colors border-2 ${
                            isActive
                              ? "bg-brand-green border-gray-800 text-brand-beige shadow-sharp-xs"
                              : "border-transparent text-gray-800 hover:bg-brand-green/30"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{ch.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
