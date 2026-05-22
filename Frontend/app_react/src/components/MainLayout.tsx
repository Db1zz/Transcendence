"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Friend, FriendsView } from "./FriendsView";
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
import { useRoles } from "../hooks/useRoles";
import { usePermissions, PERMISSION_FLAGS } from "../hooks/usePermissions";
import { useServers } from "../hooks/useServers";
import type { VoiceParticipant } from "./VoiceView";
import MobileNavBar from "./MobileNavBar";
import { ProfilePopup } from "./ProfilePopup";
import { NotificationsPage } from "./NotificationsPage";
import defaultAvatar from "../img/default.png";
import Footer from "./Footer";

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
  const { user, loading } = useAuth();
  const { incomingCall, setIncomingCall } = useNotifications();
  const { activeCall, joinOrCreateRoom, joinVoiceChannel, leaveRoom } =
    useCall();
  const {
    servers,
    createServer,
    joinServer,
    refetch: refetchServers,
  } = useServers();
  const { statuses } = useUserStatuses(user?.id ?? "");
  const { hasPermission } = usePermissions();

  const [activeView, setActiveView] = useState<
    "friends" | "chat" | "voice" | "server" | "friendsList" | "notifications"
  >("chat");
  const [inServerVoice, setInServerVoice] = useState(false);

  const [activeDmChannelId, setActiveDmChannelId] = useState<string | null>(
    null,
  );
  const [activeDmName, setActiveDmName] = useState<string>("");
  const [activeDmUsername, setActiveDmUsername] = useState<string>("");

  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [activeServerName, setActiveServerName] = useState<string>("");
  const [activeServerChannelId, setActiveServerChannelId] = useState<
    string | null
  >(null);
  const [activeServerChannelName, setActiveServerChannelName] =
    useState<string>("");
  const [serverCategories, setServerCategories] = useState<ChannelCategory[]>(
    [],
  );

  const callRedirectHandled = useRef(false);
  const activeServerIdRef = useRef<string | null>(null);
  const lastServerId = useRef<string | null>(null);

  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isDmProfileOpen, setIsDmProfileOpen] = useState(false);
  const [dmProfileUser, setDmProfileUser] = useState<User | null>(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  const { members: rawServerMembers, fetchMembers } = useServerMembers(
    activeView === "server" ? activeServerId : null,
  );
  const { roles: serverRoles, fetchRoles } = useRoles(activeServerId || "");
  const { friends: rawFriends } = useFriends();

  const serverMembersMapped: Member[] = rawServerMembers.map((m) => ({
    id: m.user.id,
    name: m.user.displayName || m.user.username,
    avatarUrl: m.user.picture,
    status: String(
      statuses[m.user.id] || "offline",
    ).toLowerCase() as MemberStatus,
    role: "Member",
  }));

  const serverSenderNameById = useMemo<Record<string, string>>(() => {
    return rawServerMembers.reduce<Record<string, string>>((acc, member) => {
      acc[member.user.id] = member.user.displayName || member.user.username;
      return acc;
    }, {});
  }, [rawServerMembers]);

  const myMemberProfile = useMemo(() => {
    if (!user) return null;
    return (
      rawServerMembers.find((member) => member.user.id === user.id) || null
    );
  }, [rawServerMembers, user]);

  const myTotalPermissions = useMemo(() => {
    if (!myMemberProfile) return 0;
    return myMemberProfile.roles.reduce((acc, roleId) => {
      const role = serverRoles.find((r) => r.id === roleId);
      return acc | (role ? role.permissions : 0);
    }, 0);
  }, [myMemberProfile, serverRoles]);

  const canManageChannels = hasPermission(
    myTotalPermissions,
    PERMISSION_FLAGS.MANAGE_CHANNELS,
  );

  const activeFriendsMapped: Member[] = rawFriends
    .filter((f) => f.isFriend === "friend")
    .map((f) => ({
      id: f.id,
      name: f.name || f.username,
      avatarUrl: f.picture,
      status: String(statuses[f.id] || "offline").toLowerCase() as MemberStatus,
    }));

  const localVoiceParticipant = useMemo<VoiceParticipant | null>(() => {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username || user.name,
      displayName: user.name,
      picture: user.picture || defaultAvatar,
    };
  }, [user]);

  const voiceParticipants = useMemo<VoiceParticipant[]>(() => {
    const merged = new Map<string, VoiceParticipant>();

    if (user) {
      const localParticipant = {
        id: user.id,
        username: user.username || user.name,
        displayName: user.name,
        picture: user.picture || defaultAvatar,
      };
      merged.set(user.id, localParticipant);
      merged.set("local", localParticipant);
    }

    rawServerMembers.forEach((member) => {
      merged.set(member.user.id, {
        id: member.user.id,
        username: member.user.username,
        displayName: member.user.displayName || member.user.username,
        picture: member.user.picture || defaultAvatar,
      });
    });

    rawFriends.forEach((friend) => {
      merged.set(friend.id, {
        id: friend.id,
        username: friend.username,
        displayName: friend.name || friend.username,
        picture: friend.picture || defaultAvatar,
      });
    });

    return Array.from(merged.values());
  }, [rawFriends, rawServerMembers, user]);

  const activeServerOwnerId = useMemo(() => {
    return servers.find((server) => server.id === activeServerId)?.ownerId;
  }, [servers, activeServerId]);

  const activeServerIconUrl = useMemo(() => {
    return servers.find((server) => server.id === activeServerId)?.iconUrl;
  }, [servers, activeServerId]);

  useEffect(() => {
    activeServerIdRef.current = activeServerId;
  }, [activeServerId]);

  const handleVoiceEvents = useCallback((...args: any[]) => {
    const targetOrgId = args.length >= 2 ? args[0] : null;
    const eventPayload = args.length >= 2 ? args[1] : args[0];

    if (
      targetOrgId &&
      activeServerIdRef.current &&
      String(targetOrgId) !== String(activeServerIdRef.current)
    ) {
      return;
    }

    const data = parseStompPayload(eventPayload);

    if (!data || typeof data !== "object") return;

    if (
      data.organizationId &&
      activeServerIdRef.current &&
      String(data.organizationId) !== String(activeServerIdRef.current)
    ) {
      return;
    }

    if (data.type === "VOICE_STATE_UPDATE") {
      setServerCategories((prevCategories) =>
        prevCategories.map((cat) => {
          if (cat.id !== "voice") return cat;

          return {
            ...cat,
            channels: cat.channels.map((ch) => {
              const updatedUsers = (ch.connectedUsers || []).filter(
                (u) => String(u.id) !== String(data.userId),
              );

              if (
                data.action === "JOIN" &&
                String(ch.id) === String(data.channelId)
              ) {
                const fallbackName = `User (${String(data.userId).slice(0, 4)})`;

                updatedUsers.push({
                  id: String(data.userId),
                  name: data.userName || fallbackName,
                  avatar: data.userAvatar || defaultAvatar,
                });
              }

              return { ...ch, connectedUsers: updatedUsers };
            }),
          };
        }),
      );
    }
  }, []);

  const { requestSync, sendOrganizationAction } = useOrganizationEvents(
    handleVoiceEvents,
    (state: any) => {
      console.log("Initial state received from sync:", state);

      if (state && state.type === "SYNC_STATE" && state.channels) {
        if (
          activeServerIdRef.current &&
          String(state.organizationId) !== String(activeServerIdRef.current)
        ) {
          return;
        }

        setServerCategories((prevCategories) =>
          prevCategories.map((cat) => {
            if (cat.id !== "voice") return cat;

            const syncMap = new Map();
            state.channels.forEach((ch: any) => {
              syncMap.set(String(ch.channelId), ch.participants || []);
            });

            return {
              ...cat,
              channels: cat.channels.map((ch) => {
                if (syncMap.has(String(ch.id))) {
                  const rawUsers = syncMap.get(String(ch.id));
                  const formattedUsers = rawUsers.map((u: any) => ({
                    id: String(u.id),
                    name: u.username || u.displayName,
                    avatar: u.picture || defaultAvatar,
                  }));
                  return { ...ch, connectedUsers: formattedUsers };
                }
                return ch;
              }),
            };
          }),
        );
      }
    },
  );

  useEffect(() => {
    if (!activeCall && user) {
      setServerCategories((prev) =>
        prev.map((cat) => {
          if (cat.id !== "voice") return cat;
          return {
            ...cat,
            channels: cat.channels.map((ch) => ({
              ...ch,
              connectedUsers: (ch.connectedUsers || []).filter(
                (u) => u.id !== user?.id,
              ),
            })),
          };
        }),
      );
    }
  }, [activeCall, user]);

  const mapPublicUserToProfile = (profile: any): User => ({
    id: profile?.id || "",
    name: profile?.displayName || profile?.username || "",
    username: profile?.username || "",
    email: "",
    picture: profile?.picture || "",
    status: (profile?.status || "offline").toLowerCase() as User["status"],
    about: profile?.about || "",
    createdAt: profile?.createdAt || "",
    role: profile?.role === "ADMIN" ? "ADMIN" : "USER",
  });

  const loadDmProfile = async (username: string, fallbackName?: string) => {
    if (!username) return null;

    const response = await api.get(
      `/users/public/${encodeURIComponent(username)}`,
    );
    const userProfile = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    if (!userProfile) return null;

    const profileUser = mapPublicUserToProfile(userProfile);
    setActiveDmName(profileUser.name || fallbackName || username);
    setActiveDmUsername(profileUser.username || username);
    setDmProfileUser(profileUser);

    return profileUser;
  };

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
      fetchRoles();
    }
  }, [activeServerId, activeView, fetchMembers, fetchRoles]);

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
    let timer: ReturnType<typeof setTimeout>;
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
                    name: user.username || user.name,
                    avatar: user.picture || defaultAvatar,
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

  const handleChannelDelete = async (channel: Channel) => {
    if (!activeServerId) return;

    try {
      if (activeCall?.roomId === channel.id) {
        leaveRoom();
        setInServerVoice(false);
      }

      if (activeServerChannelId === channel.id) {
        setActiveServerChannelId(null);
        setActiveServerChannelName("");
        localStorage.removeItem("activeServerChannelId");
        localStorage.removeItem("activeServerChannelName");
      }

      await api.delete(`/channels/${channel.id}`);
      await fetchServerData(activeServerId);
    } catch (error) {
      console.error("Failed to delete channel", error);
    }
  };

  const handleVoiceDisconnect = () => {
    const channelId = activeCall?.roomId;
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

  const handleOpenAddFriends = () => {
    handleViewChange("friends");
  };

  const handleOpenMobileProfile = () => {
    setIsMobileProfileOpen(true);
  };

  const handleOpenDmProfile = async () => {
    if (!activeDmUsername) return;

    try {
      const profileUser =
        dmProfileUser && dmProfileUser.username === activeDmUsername
          ? dmProfileUser
          : await loadDmProfile(
              activeDmUsername,
              activeDmName || activeDmUsername,
            );

      if (!profileUser) return;

      setIsDmProfileOpen(true);
    } catch (error) {
      console.error("Failed to open DM profile", error);
    }
  };

  const handleMobileMainClick = () => {
    setActiveDmChannelId(null);
    setActiveDmName("");
    setActiveDmUsername("");
    setDmProfileUser(null);
    handleViewChange("chat");
  };

  const handleServerBack = () => {
    setActiveServerChannelId(null);
    setActiveServerChannelName("");
    setInServerVoice(false);
    localStorage.removeItem("activeServerChannelId");
    localStorage.removeItem("activeServerChannelName");
  };

  const resetActiveServerState = () => {
    setActiveServerId(null);
    activeServerIdRef.current = null;
    lastServerId.current = null;
    setActiveServerName("");
    setActiveServerChannelId(null);
    setActiveServerChannelName("");
    setServerCategories([]);
    setInServerVoice(false);
    localStorage.removeItem("activeServerId");
    localStorage.removeItem("activeServerName");
    localStorage.removeItem("activeServerChannelId");
    localStorage.removeItem("activeServerChannelName");
    handleViewChange("friends");
  };

  const handleServerDeleted = async () => {
    leaveRoom();
    await refetchServers();
    resetActiveServerState();
  };

  const handleServerLeft = async () => {
    leaveRoom();
    await refetchServers();
    resetActiveServerState();
  };

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

  if (loading) return null;

  const isServerCall =
    activeCall &&
    serverCategories.some(
      (cat) =>
        cat.id === "voice" &&
        cat.channels.some((ch) => ch.id === activeCall.roomId),
    );

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

  return (
    <div className="h-dvh flex flex-col overflow-hidden relative">
      {showMobileFriendsPage ? (
        <HeaderBar type="friends" />
      ) : showMobileNotificationsPage ? (
        <HeaderBar type="notifications" />
      ) : activeView === "server" &&
        (!activeServerChannelId || inServerVoice) ? (
        <ServerHeader
          channelName={activeServerName || activeServerChannelName || "general"}
        />
      ) : showMobileMessagesPage ? (
        <HeaderBar type="messages" />
      ) : activeView === "chat" ? (
        <div className="hidden md:block">
          <HeaderBar type="messages" />
        </div>
      ) : (
        <HeaderBar type="friends" />
      )}
      <div className="flex flex-1 min-h-0 overflow-hidden flex-row">
        <div
          className={`${showMobileMessagesPage || showMobileServerPage ? "flex" : "hidden md:flex"} w-[72px] z-30 flex-col overflow-hidden flex-shrink-0`}
        >
          <NavigationSidebar
            onChatClick={() => handleViewChange("chat")}
            onFriendsClick={() => handleViewChange("friends")}
            onServerClick={handleServerClick}
            servers={servers}
            onCreateServer={createServer}
            onJoinServer={joinServer}
          />
        </div>
        <main className="flex-1 flex flex-col p-0 pb-0 md:p-2 md:pb-0 overflow-hidden relative min-h-0">
          <div className="absolute inset-0 bg-brand-green opacity-80 -z-10" />
          {activeCall &&
            activeView !== "voice" &&
            !(activeView === "server" && inServerVoice) && (
              <div className="mb-2 mr-2 flex items-center justify-between bg-brand-brick text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span className="text-sm font-medium">Voice call active</span>
                </div>
                <button
                  onClick={() => {
                    if (inServerVoice || isServerCall) {
                      setInServerVoice(true);
                      if (
                        lastServerId.current &&
                        activeServerId !== lastServerId.current
                      ) {
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
          {showMobileFriendsPage ? (
            <div className="flex h-full min-h-0 w-full md:hidden overflow-hidden pb-24">
              <FriendsView
                onOpenChat={handleMobileFriendsOpenChat}
                statuses={statuses}
              />
            </div>
          ) : showMobileNotificationsPage ? (
            <div className="flex h-full min-h-0 w-full md:hidden overflow-hidden pb-24">
              <NotificationsPage />
            </div>
          ) : showMobileServerChat ? (
            <div className="flex h-full min-h-0 w-full md:hidden overflow-hidden pb-24">
              <Chat
                personName={`# ${activeServerChannelName}`}
                userId={user?.id || ""}
                channelId={activeServerChannelId || ""}
                senderNameById={serverSenderNameById}
                onBack={handleServerBack}
              />
            </div>
          ) : showMobileServerVoice ? (
            <div className="flex h-full min-h-0 w-full md:hidden overflow-hidden pb-24">
              <VoiceView
                onLeave={handleVoiceDisconnect}
                participants={voiceParticipants}
                localParticipant={localVoiceParticipant}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-1 flex-col gap-0 overflow-hidden md:flex-row md:gap-0">
                <div
                  className={`${showMobileMessagesPage || showMobileServerPage ? "flex" : activeView === "chat" && !activeDmChannelId ? "flex" : "hidden md:flex"} flex-1 w-full md:flex-none md:w-1/5 md:flex-shrink-0 overflow-hidden relative flex-col h-full max-h-none`}
                >
                  {activeView === "server" ? (
                    <ServerLeftBar
                      serverId={activeServerId || ""}
                      serverName={activeServerName}
                      serverOwnerId={activeServerOwnerId}
                      serverIconUrl={activeServerIconUrl}
                      categories={serverCategories}
                      activeChannelId={activeServerChannelId || ""}
                      onSelectChannel={handleChannelSelect}
                      canManageChannels={canManageChannels}
                      onDeleteChannel={handleChannelDelete}
                      onServerDeleted={handleServerDeleted}
                      onServerLeft={handleServerLeft}
                      onChannelsChanged={async () => {
                        if (activeServerId) {
                          await fetchServerData(activeServerId);
                        }
                      }}
                    />
                  ) : (
                    <LeftBar
                      onFriendsClick={() => handleViewChange("friends")}
                      onChatChannelClick={handleChatChannelClick}
                      onAddFriendsClick={handleOpenAddFriends}
                    />
                  )}
                  {user && (
                    <div className="hidden md:block absolute bottom-0 left-0 right-0 p-2 z-40 pointer-events-none">
                      <ProfileButton
                        user={user}
                        className="w-full pointer-events-auto"
                      />
                    </div>
                  )}
                </div>
                <div
                  className={`${showMobileMessagesPage ? "hidden md:flex" : "flex"} flex-1 min-h-0 overflow-hidden`}
                >
                  <div className="flex h-full min-h-0 w-full">
                    {activeView === "server" ? (
                      inServerVoice ? (
                        <VoiceView
                          onLeave={handleVoiceDisconnect}
                          participants={voiceParticipants}
                          localParticipant={localVoiceParticipant}
                        />
                      ) : activeServerChannelId ? (
                        <Chat
                          personName={`# ${activeServerChannelName}`}
                          userId={user?.id || ""}
                          channelId={activeServerChannelId}
                          senderNameById={serverSenderNameById}
                        />
                      ) : null
                    ) : isFriendsView ? (
                      <div className="block w-full h-full">
                        <FriendsView
                          statuses={statuses}
                          onOpenChat={async (friend) => {
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
                          }}
                        />
                      </div>
                    ) : activeView === "voice" ? (
                      <VoiceView
                        onLeave={handleVoiceDisconnect}
                        participants={voiceParticipants}
                        localParticipant={localVoiceParticipant}
                      />
                    ) : !activeDmChannelId ? (
                      <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center text-center text-brand-beige">
                        <div className="max-w-xs px-6">
                          {t("home.selectFriendToChat")}
                        </div>
                      </div>
                    ) : (
                      <Chat
                        personName={activeDmName}
                        userId={user?.id || ""}
                        channelId={activeDmChannelId}
                        onPersonNameClick={handleOpenDmProfile}
                        onBack={() => handleViewChange("friends")}
                      />
                    )}
                  </div>
                </div>
                <div className="hidden lg:block w-1/5 flex-shrink-0 overflow-hidden">
                  <RightBar>
                    {activeView === "server" && (
                      <div className="flex flex-col h-full w-full">
                        <MemberList members={serverMembersMapped} />
                      </div>
                    )}
                    {isFriendsView && (
                      <div className="flex flex-col h-full w-full">
                        {activeFriendsMapped.length === 0 ? (
                          <p className="text-brand-beige/70 text-sm mt-4 text-center italic">
                            No friends online.
                          </p>
                        ) : (
                          <MemberList members={activeFriendsMapped} />
                        )}
                      </div>
                    )}
                  </RightBar>
                </div>
              </div>
            </>
          )}
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
	  <Footer />
    </div>
  );
};

export default MainLayout;
