import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Hash,
  Volume2,
  Plus,
  UserPlus,
  Settings,
  X,
  Copy,
  Check,
  PhoneOff,
} from "lucide-react";
import bgLSideBar from "../img/bg_l_sidebar.png";
import api from "../utils/api";
import { useCall } from "../hooks/useCall";
import { useAuth } from "../contexts/AuthContext";
import { useOrganizationEvents } from "../hooks/useOrganizationEvents";
import { ServerSettingsModal } from "./ServerSettingsModal";

export type ChannelType = "text" | "voice";

export interface ConnectedUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  unread?: boolean;
  connectedUsers?: ConnectedUser[];
}

export interface ChannelCategory {
  id: string;
  name: string;
  channels: Channel[];
}

interface ServerLeftBarProps {
  serverId: string;
  serverName: string;
  categories: ChannelCategory[];
  activeChannelId: string;
  onSelectChannel: (channel: Channel) => void;
}

export const ServerLeftBar: React.FC<ServerLeftBarProps> = ({
  serverId,
  serverName,
  categories,
  activeChannelId,
  onSelectChannel,
}) => {
  const { user } = useAuth();
  const { sendToOrganization, sendOrganizationAction } =
    useOrganizationEvents();
  const { activeCall, leaveRoom, joinVoiceChannel } = useCall();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChannelClick = async (ch: Channel) => {
    if (ch.type === "voice") {
      try {
        await joinVoiceChannel(ch.id);

        if (user) {
          sendToOrganization(serverId, {
            type: "VOICE_STATE_UPDATE",
            userId: user.id,
            userName: user.name,
            userAvatar: user.picture,
            channelId: ch.id,
            action: "JOIN",
          });
        }
      } catch (error) {
        console.error("Failed to connect to voice channel:", error);
      }
    }

    onSelectChannel(ch);
  };

  const handleDisconnect = () => {
    let channelId = activeCall?.roomId;
    if (channelId && user) {
      sendOrganizationAction(serverId, `voice/${channelId}/leave`, {
        type: "VOICE_STATE_UPDATE",
        userId: user.id,
        userName: user.name,
        channelId: null,
        action: "LEAVE",
      });
      leaveRoom();
    }
  };

  const handleGenerateInvite = async () => {
    setIsMenuOpen(false);
    setInviteModalOpen(true);
    setInviteCode(null);
    setCopied(false);
    try {
      const res = await api.post(`/organizations/${serverId}/invites`);
      setInviteCode(res.data.code);
    } catch (error) {
      console.error("Failed to generate invite:", error);
    }
  };

  const copyToClipboard = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="flex-1 rounded-tl-lg border border-brand-green relative flex flex-col min-h-0">
        <div
          className="absolute inset-0 bg-cover bg-center rounded-tl-lg"
          style={{ backgroundImage: `url(${bgLSideBar})` }}
        />
        <div className="absolute inset-0 bg-brand-peach opacity-90 rounded-tl-lg" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-full flex h-12 shrink-0 items-center justify-between border-b-2 border-gray-800 bg-brand-brick px-4 text-brand-beige shadow-sm hover:bg-brand-brick/90 transition-colors"
            >
              <h2 className="truncate font-ananias text-base font-bold uppercase">
                {serverName}
              </h2>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isMenuOpen && (
              <div className="absolute top-12 left-2 right-2 bg-brand-beige border-2 border-brand-green rounded-md shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={handleGenerateInvite}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-brand-green hover:bg-brand-green hover:text-brand-beige transition-colors"
                >
                  <span>Invite People</span>
                  <UserPlus className="h-4 w-4" />
                </button>
                <div className="mx-2 my-1 border-b border-brand-green/20" />
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setSettingsModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <span>Server Settings</span>
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-2 py-3 scrollbar-hide mt-2">
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
                          <div key={ch.id} className="flex flex-col">
                            <button
                              onClick={() => handleChannelClick(ch)}
                              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-roboto font-medium transition-colors border-2 ${isActive ? "bg-brand-green border-gray-800 text-brand-beige shadow-sharp-xs" : "border-transparent text-gray-800 hover:bg-brand-green/30"}`}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{ch.name}</span>
                            </button>
                            {ch.type === "voice" &&
                              ch.connectedUsers &&
                              ch.connectedUsers.length > 0 && (
                                <div className="flex flex-col mt-1 mb-1 pl-6 space-y-1">
                                  {ch.connectedUsers.map((u) => (
                                    <div
                                      key={u.id}
                                      className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/30 cursor-pointer transition-colors"
                                    >
                                      {u.avatar ? (
                                        <img
                                          src={u.avatar}
                                          alt={u.name}
                                          className="w-6 h-6 rounded-full border border-gray-800 object-cover"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center text-xs text-brand-beige font-bold border border-gray-800">
                                          {u.name
                                            ? u.name.charAt(0).toUpperCase()
                                            : "?"}
                                        </div>
                                      )}
                                      <span className="text-sm text-gray-800 font-medium truncate">
                                        {u.name || "User"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {activeCall && (
            <div className="mt-auto shrink-0 bg-brand-green border-t border-brand-brick p-3 flex flex-col gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
              <div className="flex items-center justify-between">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1 text-brand-beige font-bold text-xs uppercase tracking-wider">
                    <Volume2 size={14} className="animate-pulse" /> Voice
                    Connected
                  </div>
                  <div className="text-xs text-brand-beige/80 truncate font-medium">
                    {serverName}
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="p-1.5 bg-brand-brick hover:bg-red-600 text-white rounded-md transition-colors shadow-sm"
                  title="Disconnect"
                >
                  <PhoneOff size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-brand-beige rounded-lg shadow-xl w-full max-w-sm overflow-hidden border-2 border-brand-green p-6 relative">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-4 right-4 text-brand-green hover:text-brand-brick"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-brand-green mb-2">
              Invite friends to {serverName}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this code with others so they can join your server. It
              expires in 1 day.
            </p>
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded p-2">
              <input
                type="text"
                readOnly
                value={inviteCode || "Generating..."}
                className="flex-1 bg-transparent text-gray-800 font-mono font-bold focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                disabled={!inviteCode}
                className="bg-brand-green text-brand-beige p-2 rounded hover:bg-brand-brick transition-colors disabled:opacity-50"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-brand-green mt-2 font-bold text-right">
                Copied!
              </p>
            )}
          </div>
        </div>
      )}
      <ServerSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        serverId={serverId}
        serverName={serverName}
      />
    </>
  );
};
