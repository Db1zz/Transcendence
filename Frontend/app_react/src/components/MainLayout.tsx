"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Friend, FriendsView } from "./FriendsView";
import { NavigationSidebar } from "./navigation/NavigationSideBar";
import Chat from "./Chat";
import ProfileButton from "../components/ProfileButton";
import { HeaderBar } from "./navigation/HeaderBar";
import { LeftBar } from "./navigation/LeftBar";
import RightBar from "./navigation/RightBar";
import { VoiceView } from "./VoiceView";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ServerLeftBar, ChannelCategory } from "./ServerLeftBar";
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
        data = data.replace(/\0/g, '').trim();

        let parseAttempts = 0;
        while (typeof data === "string" && parseAttempts < 5) {
            try {
                const parsed = JSON.parse(data);
                if (parsed === data) break;
                data = parsed;
                parseAttempts++;
            } catch (err) {
                if (typeof data === "string" && data.startsWith('"') && data.endsWith('"')) {
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
    const { activeCall, joinOrCreateRoom, joinVoiceChannel } = useCall();
    const { statuses } = useUserStatuses(user?.id ?? "");

    const [activeView, setActiveView] = useState<"friends" | "chat" | "voice" | "server">("friends");
    const [inServerVoice, setInServerVoice] = useState(false);

    const [activeDmChannelId, setActiveDmChannelId] = useState<string | null>(null);
    const [activeDmName, setActiveDmName] = useState<string>("");

    const [activeServerId, setActiveServerId] = useState<string | null>(null);
    const [activeServerName, setActiveServerName] = useState<string>("");
    const [activeServerChannelId, setActiveServerChannelId] = useState<string | null>(null);
    const [activeServerChannelName, setActiveServerChannelName] = useState<string>("");
    const [serverCategories, setServerCategories] = useState<ChannelCategory[]>([]);

    const callRedirectHandled = useRef(false);
    const activeServerIdRef = useRef<string | null>(null);
    const lastServerId = useRef<string | null>(null);

    const { members: rawServerMembers, fetchMembers } = useServerMembers(activeView === "server" ? activeServerId : null);
    const { friends: rawFriends } = useFriends();

    const serverMembersMapped: Member[] = rawServerMembers.map(m => ({
        id: m.user.id,
        name: m.user.displayName || m.user.username,
        avatarUrl: m.user.picture,
        status: (statuses[m.user.id] as MemberStatus) || (m.user.status?.toLowerCase() as MemberStatus) || "offline",
        role: "Member"
    }));

    const activeFriendsMapped: Member[] = rawFriends
        .filter(f => f.isFriend === "friend")
        .map(f => ({
            id: f.id,
            name: f.name || f.username,
            avatarUrl: f.picture,
            status: (statuses[f.id] as MemberStatus) || (f.status?.toLowerCase() as MemberStatus) || "offline",
        }));

    useEffect(() => {
        activeServerIdRef.current = activeServerId;
    }, [activeServerId]);

    const handleVoiceEvents = useCallback((...args: any[]) => {
        const targetOrgId = args.length >= 2 ? args[0] : null;
        const eventPayload = args.length >= 2 ? args[1] : args[0];

        if (targetOrgId && activeServerIdRef.current && String(targetOrgId) !== String(activeServerIdRef.current)) {
            return;
        }

        const data = parseStompPayload(eventPayload);

        if (!data || typeof data !== "object") return;

        if (data.organizationId && activeServerIdRef.current && String(data.organizationId) !== String(activeServerIdRef.current)) {
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
                                (u) => String(u.id) !== String(data.userId)
                            );

                            if (data.action === "JOIN" && String(ch.id) === String(data.channelId)) {
                                const fallbackName = `User (${String(data.userId).slice(0, 4)})`;

                                updatedUsers.push({
                                    id: String(data.userId),
                                    name: data.userName || fallbackName,
                                    avatar: data.userAvatar,
                                });
                            }

                            return { ...ch, connectedUsers: updatedUsers };
                        }),
                    };
                })
            );
        }
    }, []);

    const { requestSync, sendOrganizationAction } = useOrganizationEvents(
        handleVoiceEvents,
        (state: any) => {
            console.log("Initial state received from sync:", state);

            if (state && state.type === "SYNC_STATE" && state.channels) {
                if (activeServerIdRef.current && String(state.organizationId) !== String(activeServerIdRef.current)) {
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
                                        name: u.displayName,
                                        avatar: u.picture
                                    }));
                                    return { ...ch, connectedUsers: formattedUsers };
                                }
                                return ch;
                            }),
                        };
                    })
                );
            }
        }
    );

    useEffect(() => {
        if (!activeCall && user) {
            setServerCategories((prev) => prev.map(cat => {
                if (cat.id !== "voice") return cat;
                return {
                    ...cat,
                    channels: cat.channels.map(ch => ({
                        ...ch,
                        connectedUsers: (ch.connectedUsers || []).filter(u => u.id !== user?.id)
                    }))
                };
            }));
        }
    }, [activeCall, user]);

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
                    connectedUsers: c.connectedUsers || []
                }));

            setServerCategories([
                { id: "text", name: "Text Channels", channels: textChannels },
                { id: "voice", name: "Voice Channels", channels: voiceChannels },
            ]);

            const savedChannelId = localStorage.getItem("activeServerChannelId");
            if (savedChannelId && textChannels.some((c: any) => c.id === savedChannelId)) {
                setActiveServerChannelId(savedChannelId);
                setActiveServerChannelName(localStorage.getItem("activeServerChannelName") || "");
            } else if (textChannels.length > 0) {
                setActiveServerChannelId(textChannels[0].id);
                setActiveServerChannelName(textChannels[0].name);
            }
        } catch (error) {
            console.error(error);
        }
    };

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
        let timer: NodeJS.Timeout;
        if (incomingCall) {
            timer = setTimeout(() => {
                setIncomingCall(null);
            }, 15000);
        }
        return () => { if (timer) clearTimeout(timer); };
    }, [incomingCall, setIncomingCall]);

    const handleViewChange = (view: "friends" | "chat" | "voice" | "server") => {
        setActiveView(view);
        localStorage.setItem("activeView", view);
    };

    const handleChatChannelClick = (channelId: string, userName: string) => {
        setActiveDmChannelId(channelId);
        setActiveDmName(userName);
        handleViewChange("chat");
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
                setServerCategories((prev) => prev.map(cat => {
                    if (cat.id !== "voice") return cat;
                    return {
                        ...cat,
                        channels: cat.channels.map(ch => {
                            const users = (ch.connectedUsers || []).filter(u => String(u.id) !== String(user.id));
                            if (ch.id === c.id) {
                                users.push({ id: user.id, name: user.name, avatar: user.picture });
                            }
                            return { ...ch, connectedUsers: users };
                        })
                    };
                }));
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
                action: "LEAVE"
            });
        }
    };

    const renderMainContent = () => {
        if (activeView === "server") {
            if (inServerVoice) {
                return (
                    <VoiceView
                        onLeave={handleVoiceDisconnect}
                    />);
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
            return <FriendsView onOpenChat={ handleOpenDm } statuses={ statuses } />;
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

    const isServerCall = activeCall && serverCategories.some(cat =>
        cat.id === "voice" && cat.channels.some(ch => ch.id === activeCall.roomId)
    );

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
                                        if (lastServerId.current && activeServerId !== lastServerId.current) {
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
                                    onSelectChannel={handleChannelSelect}
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
                                {renderMainContent()}
                            </div>
                        </div>
                        <div className="hidden lg:block w-1/5 flex-shrink-0 overflow-hidden">
                            <RightBar>
                                {activeView === "server" && (
                                    <div className="flex flex-col h-full">
                                        <h3 className="text-brand-beige font-ananias text-sm border-b border-brand-green/30 pb-2 mb-2 uppercase">
                                            Server Members
                                        </h3>
                                        <MemberList members={serverMembersMapped} />
                                    </div>
                                )}
                                {activeView === "friends" && (
                                    <div className="flex flex-col h-full">
                                        <h3 className="text-brand-beige font-ananias text-sm border-b border-brand-green/30 pb-2 mb-2 uppercase">
                                            Active Friends
                                        </h3>
                                        {activeFriendsMapped.length === 0 ? (
                                            <p className="text-brand-beige/70 text-sm mt-4 text-center italic">No friends online.</p>
                                        ) : (
                                            <MemberList members={activeFriendsMapped} />
                                        )}
                                    </div>
                                )}
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
        </div>
    );
};

export default MainLayout;