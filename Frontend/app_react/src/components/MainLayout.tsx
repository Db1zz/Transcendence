"use client";

import React, { useState, useEffect, useRef } from "react";
import { FriendsView } from "./FriendsView";
import { NavigationSidebar } from "./navigation/NavigationSideBar";
import Chat from "./Chat";
import ProfileButton from "../components/ProfileButton";
import { HeaderBar } from "./navigation/HeaderBar";
import { LeftBar } from "./navigation/LeftBar";
import RightBar from "./navigation/RightBar";
import { VoiceView } from "./VoiceView";
import { useAuth, type User } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ServerLeftBar, ChannelCategory, Channel } from "./ServerLeftBar";
import { ServerHeader } from "./ServerHeader";
import { MemberList, Member, MemberStatus } from "./MemberList";
import api from "../utils/api";
import { IncomingCallNotification } from "./IncomingCallNotification";
import { ArrowUpRight, Phone } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import { useCall } from "../hooks/useCall";
import { useOrganizationEvents } from "../hooks/useOrganizationEvents";
import { useUserStatuses } from "../hooks/useUserStatuses";

import { useServerMembers } from "../hooks/useServerMembers";
import { useFriends } from "../hooks/useFriends";

const parseStompPayload = (data: any) => {
  if (data && typeof data === "object") {
    data = data.body ?? data.data ?? data;
  }

  if (typeof data === "string") {
    data = data.replace(/\0/g, "").trim();

    let parseAttempts = 0;
    while (typeof data === "string" && parseAttempts < 5) {
      try {
        const parsed = JSON.parse(data);
        if (parsed === data) break;
        data = parsed;
        parseAttempts++;
      } catch (err) {
        if (
          typeof data === "string" &&
          data.startsWith('"') &&
          data.endsWith('"')
        ) {
          data = data.slice(1, -1).replace(/\\"/g, '"');
          continue;
        }
        break;
      }
    }
  }
  return data;
};

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { t } = useTranslation();
    const [activeView, setActiveView] = useState<"friends" | "chat" | "voice" | "server">("friends");
    const [inServerVoice, setInServerVoice] = useState(false);
    const { incomingCall, setIncomingCall } = useNotifications();
    const { activeCall, joinOrCreateRoom, joinVoiceChannel } = useCall();
    const [activeDmChannelId, setActiveDmChannelId] = useState<string | null>(null);
    const [activeDmName, setActiveDmName] = useState<string>("");
    const [activeServerId, setActiveServerId] = useState<string | null>(null);
    const [activeServerName, setActiveServerName] = useState<string>("");
    const [activeServerChannelId, setActiveServerChannelId] = useState<string | null>(null);
    const [activeServerChannelName, setActiveServerChannelName] = useState<string>("");
    const [serverCategories, setServerCategories] = useState<ChannelCategory[]>([]);
    const { user, loading } = useAuth();
    const callRedirectHandled = useRef(false);
    const lastServerId = useRef<string | null>(null);

  const fetchServerData = async (serverId: string) => {
    try {
      const response = await api.get(`/organizations/${serverId}/channels`);
      const channels = response.data;

      const textChannels = channels
        .filter((c: any) => c.type === "TEXT")
        .map((c: any) => ({ id: c.id, name: c.name, type: "text" }));

      const voiceChannels = channels
        .filter((c: any) => c.type === "VOICE")
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          type: "voice",
          connectedUsers: c.connectedUsers || [],
        }));

      setServerCategories([
        { id: "text", name: "Text Channels", channels: textChannels },
        { id: "voice", name: "Voice Channels", channels: voiceChannels },
      ]);
      setServerCategories([
        { id: "text", name: "Text Channels", channels: textChannels },
        { id: "voice", name: "Voice Channels", channels: voiceChannels },
      ]);

      const savedChannelId = localStorage.getItem("activeServerChannelId");
      if (
        !isMobile &&
        savedChannelId &&
        textChannels.some((c: any) => c.id === savedChannelId)
      ) {
        setActiveServerChannelId(savedChannelId);
        setActiveServerChannelName(
          localStorage.getItem("activeServerChannelName") || "",
        );
      } else if (!isMobile && textChannels.length > 0) {
        setActiveServerChannelId(textChannels[0].id);
        setActiveServerChannelName(textChannels[0].name);
      } else {
        setActiveServerChannelId(null);
        setActiveServerChannelName("");
      }
    } catch (error) {
      console.error("Failed to fetch server channels", error);
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  useEffect(() => {
    const savedView = localStorage.getItem("activeView") as any;
    if (savedView) setActiveView(savedView);

    const savedServerId = localStorage.getItem("activeServerId");
    const savedServerName = localStorage.getItem("activeServerName");

    if (savedView === "server" && savedServerId) {
      setActiveServerId(savedServerId);
      activeServerIdRef.current = savedServerId;
      lastServerId.current = savedServerId;
      setActiveServerName(savedServerName || "");
      fetchServerData(savedServerId);
    }
  }, []);

  useEffect(() => {
    if (activeView === "server" && activeServerId) {
      fetchMembers();
    }
  }, [activeServerId, activeView, fetchMembers]);

  useEffect(() => {
    if (activeCall) {
      if (!callRedirectHandled.current && activeView !== "server") {
        setActiveView("voice");
        callRedirectHandled.current = true;
      }
    } else {
      callRedirectHandled.current = false;
      setInServerVoice(false);
      if (activeView === "voice") setActiveView("friends");
    }
  }, [activeCall, activeView]);
  useEffect(() => {
    if (activeCall) {
      if (!callRedirectHandled.current && activeView !== "server") {
        setActiveView("voice");
        callRedirectHandled.current = true;
      }
    } else {
      callRedirectHandled.current = false;
      setInServerVoice(false);
      if (activeView === "voice") setActiveView("friends");
    }
  }, [activeCall, activeView]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (incomingCall) {
      timer = setTimeout(() => {
        setIncomingCall(null);
      }, 15000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [incomingCall, setIncomingCall]);

  const handleViewChange = (
    view:
      | "friends"
      | "chat"
      | "voice"
      | "server"
      | "friendsList"
      | "notifications",
  ) => {
    setIsMobileProfileOpen(false);
    setIsDmProfileOpen(false);
    setActiveView(view);
    localStorage.setItem("activeView", view);
  };

  const handleChatChannelClick = (channelId: string, userName: string) => {
    setActiveDmChannelId(channelId);
    setActiveDmName(userName);
    setActiveDmUsername(userName);
    setDmProfileUser(null);
    handleViewChange("chat");
    void loadDmProfile(userName, userName).catch((error) => {
      console.error("Failed to load DM profile", error);
    });
  };

  const handleServerClick = async (serverId: string, serverName: string) => {
    setActiveServerId(serverId);
    activeServerIdRef.current = serverId;
    lastServerId.current = serverId;
    setActiveServerName(serverName);
    localStorage.setItem("activeServerId", serverId);
    localStorage.setItem("activeServerName", serverName);
    handleViewChange("server");
    await fetchServerData(serverId);
    requestSync(serverId);
  };

  const handleChannelSelect = (c: any) => {
    setActiveServerChannelId(c.id);
    setActiveServerChannelName(c.name);
    localStorage.setItem("activeServerChannelId", c.id);
    localStorage.setItem("activeServerChannelName", c.name);

    if (c.type === "voice") {
      joinVoiceChannel(c.id);
      setInServerVoice(true);

      if (user) {
        setServerCategories((prev) =>
          prev.map((cat) => {
            if (cat.id !== "voice") return cat;
            return {
              ...cat,
              channels: cat.channels.map((ch) => {
                const users = (ch.connectedUsers || []).filter(
                  (u) => String(u.id) !== String(user.id),
                );
                if (ch.id === c.id) {
                  users.push({
                    id: user.id,
                    name: user.name,
                    avatar: user.picture,
                  });
                }
                return { ...ch, connectedUsers: users };
              }),
            };
          }),
        );
      }
    } else {
      setInServerVoice(false);
    }
  };

  const handleOpenDm = async (friend: any) => {
    if (!user) return;
    try {
      const response = await api.post("/channels", {
        name: null,
        channelType: "TEXT",
        organizationId: null,
        memberIds: [user.id, friend.id],
      });
      setActiveDmChannelId(response.data.id);
      setActiveDmName(friend.name);
      handleViewChange("chat");
    } catch (e) {
      console.error(e);
    }
  };

  const handleVoiceDisconnect = () => {
    let channelId = activeCall?.roomId;
    if (activeServerId && channelId && user) {
      sendOrganizationAction(activeServerId, `voice/${channelId}/leave`, {
        type: "VOICE_STATE_UPDATE",
        userId: user.id,
        userName: user.name,
        channelId: null,
        action: "LEAVE",
      });
    }
  };

  const renderMainContent = () => {
    if (activeView === "server") {
      if (inServerVoice) {
        return <VoiceView onLeave={handleVoiceDisconnect} />;
      }
      if (activeServerChannelId) {
        return (
          <Chat
            personName={`# ${activeServerChannelName}`}
            userId={user?.id || ""}
            channelId={activeServerChannelId}
            hideHeader={true}
          />
        );
      }
      return (
        <div className="flex h-full items-center justify-center text-brand-beige">
          No text channels available.
        </div>
      );
    }

    if (activeView === "friends") {
      return <FriendsView onOpenChat={handleOpenDm} statuses={statuses} />;
    }

    if (activeView === "voice") {
      return <VoiceView />;
    }

    if (!activeDmChannelId) {
      return (
        <div className="flex h-full items-center justify-center text-brand-beige">
          {t("home.selectFriendToChat")}
        </div>
      );
    }

    return (
      <Chat
        personName={activeDmName}
        userId={user?.id || ""}
        channelId={activeDmChannelId}
      />
    );
  };

  if (loading) return null;
  const showMobileMessagesPage = activeView === "chat" && !activeDmChannelId;
  const activeServerChannel = serverCategories.reduce<Channel | undefined>(
    (foundChannel, category) => {
      if (foundChannel) return foundChannel;
      return category.channels.find(
        (channel) => channel.id === activeServerChannelId,
      );
    },
    undefined,
  );
  const showMobileServerChannel =
    isMobile && activeView === "server" && Boolean(activeServerChannelId);
  const showMobileServerChat = showMobileServerChannel && !inServerVoice;
  const showMobileServerVoice = showMobileServerChannel && inServerVoice;
  const showMobileServerPage =
    isMobile && activeView === "server" && !showMobileServerChannel;
  const showMobileFriendsPage = isMobile && activeView === "friendsList";
  const showMobileNotificationsPage =
    isMobile && activeView === "notifications";
  const isFriendsView =
    activeView === "friends" || activeView === "friendsList";

  const handleServerBack = () => {
    setActiveServerChannelId(null);
    setActiveServerChannelName("");
    setInServerVoice(false);
    localStorage.removeItem("activeServerChannelId");
    localStorage.removeItem("activeServerChannelName");
  };

  const isServerCall =
    activeCall &&
    serverCategories.some(
      (cat) =>
        cat.id === "voice" &&
        cat.channels.some((ch) => ch.id === activeCall.roomId),
    );

  const handleMobileFriendsOpenChat = async (friend: {
    id: string;
    name: string;
    username: string;
    picture?: string;
  }) => {
    if (!user) return;
    try {
      const response = await api.post("/channels", {
        name: null,
        channelType: "TEXT",
        organizationId: null,
        memberIds: [user.id, friend.id],
      });
      setActiveDmChannelId(response.data.id);
      setActiveDmName(friend.name);
      setActiveDmUsername(friend.username);
      setDmProfileUser({
        id: friend.id,
        name: friend.name,
        username: friend.username,
        email: "",
        picture: friend.picture || "",
        status: "online",
        about: "",
        createdAt: "",
        role: "USER",
      });
      handleViewChange("chat");
    } catch (error) {
      console.error(error);
    }
  };

    return (
        <div className="h-screen flex flex-col overflow-hidden relative">
            {activeView === "server" ? (
                <ServerHeader channelName={activeServerChannelName || "general"} />
            ) : (
                <HeaderBar type={activeView === "chat" ? "messages" : "friends"} />
            )}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                <div className="flex w-[72px] z-30 flex-col overflow-hidden">
                    <NavigationSidebar
                        onChatClick={() => handleViewChange("chat")}
                        onFriendsClick={() => handleViewChange("friends")}
                        onServerClick={handleServerClick}
                    />
                </div>
                <main className="flex-1 flex flex-col pt-2 pl-2 pr-0 md:p-2 overflow-hidden relative min-h-0">
                    <div className="absolute inset-0 bg-brand-green opacity-80 -z-10"></div>
                    {activeCall && activeView !== "voice" && !(activeView === "server" && inServerVoice) && (
                        <div className="mb-2 mr-2 flex items-center justify-between bg-brand-brick text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Phone size={16} />
                                <span className="text-sm font-medium">Voice call active</span>
                            </div>
                            <button
                                onClick={() => {
                                    if (inServerVoice || isServerCall) {
                                        setInServerVoice(true);
                                        if(lastServerId.current && activeServerId !== lastServerId.current) {
                                            setActiveServerId(lastServerId.current);
                                        }
                                        handleViewChange("server");
                                    } else {
                                        handleViewChange("voice");
                                    }
                                }}
                                className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                            >
                                Return <ArrowUpRight size={14} />
                            </button>
                        </div>
                    )}
                    <div className="flex flex-1 flex-row gap-0 overflow-hidden">
                        <div className="w-full md:w-1/5 flex-shrink-0 overflow-hidden relative flex flex-col">
                            {activeView === "server" ? (
                                <ServerLeftBar
                                    serverId={activeServerId || ""}
                                    serverName={activeServerName}
                                    categories={serverCategories}
                                    activeChannelId={activeServerChannelId || ""}
                                    onSelectChannel={(c) => {
                                        setActiveServerChannelId(c.id);
                                        setActiveServerChannelName(c.name);
                                        localStorage.setItem("activeServerChannelId", c.id);
                                        localStorage.setItem("activeServerChannelName", c.name);
                                        if (c.type === "voice") {
                                            joinVoiceChannel(c.id);
                                            setInServerVoice(true);
                                        } else {
                                            setInServerVoice(false);
                                        }
                                    }}
                                />
                            ) : (
                                <LeftBar
                                    onFriendsClick={() => handleViewChange("friends")}
                                    onChatChannelClick={handleChatChannelClick}
                                />
                            )}
                            {user && (
                                <div className="mt-auto p-2 z-40">
                                    <ProfileButton user={user} className="w-full" />
                                </div>
                            )}
                        </div>
                        <div className="hidden md:flex flex-1 min-h-0 overflow-hidden">
                            <div className="flex-1 min-h-0">
                                {activeView === "server" ? (
                                    inServerVoice ? (
                                        <VoiceView />
                                    ) : activeServerChannelId ? (
                                        <Chat
                                            personName={`# ${activeServerChannelName}`}
                                            userId={user?.id || ""}
                                            channelId={activeServerChannelId}
                                            hideHeader={true}
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-brand-beige">
                                            No text channels available.
                                        </div>
                                    )
                                ) : activeView === "friends" ? (
                                    <FriendsView onOpenChat={async (friend) => {
                                        if (!user) return;
                                        try {
                                            const response = await api.post("/channels", {
                                                name: null, channelType: "TEXT", organizationId: null, memberIds: [user.id, friend.id],
                                            });
                                            setActiveDmChannelId(response.data.id);
                                            setActiveDmName(friend.name);
                                            handleViewChange("chat");
                                        } catch (e) { console.error(e); }
                                    }} />
                                ) : activeView === "voice" ? (
                                    <VoiceView />
                                ) : !activeDmChannelId ? (
                                    <div className="flex h-full items-center justify-center text-brand-beige">
                                        {t("home.selectFriendToChat")}
                                    </div>
                                ) : (
                                    <Chat
                                        personName={activeDmName}
                                        userId={user?.id || ""}
                                        channelId={activeDmChannelId}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="hidden lg:block w-1/5 flex-shrink-0 overflow-hidden">
                            <RightBar>
                                {activeView === "server" && <MemberList members={mockMembers} />}
                            </RightBar>
                        </div>
                    </div>
                </main>
            </div>

      {incomingCall && (
        <IncomingCallNotification
          event={incomingCall}
          onAnswer={(roomId) => {
            setIncomingCall(null);
            joinOrCreateRoom(roomId);
          }}
          onReject={() => setIncomingCall(null)}
        />
      )}

      {!(activeView === "chat" && activeDmChannelId) && (
        <MobileNavBar
          active={activeView}
          onNavigate={(v) => handleViewChange(v)}
          onMainClick={handleMobileMainClick}
          onYouClick={handleOpenMobileProfile}
        />
      )}

      {user && (
        <ProfilePopup
          user={user}
          isOpen={isMobileProfileOpen}
          onClose={() => setIsMobileProfileOpen(false)}
        />
      )}

      {dmProfileUser && (
        <ProfilePopup
          user={dmProfileUser}
          isOpen={isDmProfileOpen}
          onClose={() => setIsDmProfileOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
