"use client";

import React, { useState, useEffect } from "react";
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
import { MemberList, Member } from "./MemberList";
import api from "../utils/api";
import { IncomingCallNotification } from "./IncomingCallNotification";
import { useNotifications } from "../contexts/NotificationContext";
import { useCall } from "../hooks/useCall";

const mockCategories: ChannelCategory[] = [
  {
    id: "text",
    name: "Text Channels",
    channels: [
      { id: "general", name: "general", type: "text" },
      { id: "help", name: "help", type: "text" },
    ],
  },
  {
    id: "voice",
    name: "Voice Channels",
    channels: [{ id: "lounge", name: "Lounge", type: "voice" }],
  },
];
const mockMembers: Member[] = [
  { id: "1", name: "Kaneki", status: "online", role: "Admin" },
  { id: "2", name: "Touka", status: "idle", role: "Staff" },
  { id: "3", name: "Hide", status: "offline" },
];
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<
    "friends" | "chat" | "voice" | "server"
  >("friends");
  const { incomingCall, setIncomingCall } = useNotifications();
  const [activeDmChannelId, setActiveDmChannelId] = useState<string | null>(null);
  const [activeDmName, setActiveDmName] = useState<string>("");
  const [, setActiveServerId] = useState<string | null>(null);
  const [activeServerChannelId, setActiveServerChannelId] = useState<string>("general");
  const { activeCall, joinOrCreateRoom } = useCall();

  const { user, loading } = useAuth();

  useEffect(() => {
    const savedView = localStorage.getItem("activeView") as any;
    if (savedView) setActiveView(savedView);
  }, []);

  useEffect(() => {
      if (activeCall) {
        setActiveView("voice");
      }
  }, [activeCall]);

  const handleViewChange = (view: "friends" | "chat" | "voice" | "server") => {
    setActiveView(view);
    localStorage.setItem("activeView", view);
  };

  const handleOpenChatFromFriendList = async (friend: Friend) => {
    if (!user) return;
    
    try {
      const response = await api.post("/channels", {
        name: null,
        channelType: "TEXT",
        organizationId: null,
        memberIds: [user.id, friend.id]
      });
      
      setActiveDmChannelId(response.data.id);
      setActiveDmName(friend.name);
      handleViewChange("chat");
    } catch (error) {
      console.error("Failed to open DM channel:", error);
    }
  };

  const handleChatChannelClick = (channelId: string, userName: string) => {
    setActiveDmChannelId(channelId);
    setActiveDmName(userName);
    handleViewChange("chat");
  };

  const handleServerClick = (serverId: string) => {
    setActiveServerId(serverId);
    handleViewChange("server");
  };

  if (loading) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {activeView === "server" ? (
        <ServerHeader channelName={activeServerChannelId} />
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
        <main className="flex-1 flex gap-0 pt-2 pl-2 pr-0 md:p-2 overflow-hidden relative min-h-0">
          <div className="absolute inset-0 bg-brand-green opacity-80 -z-10"></div>
          <div className="w-full md:w-1/5 flex-shrink-0 overflow-hidden relative">
            {activeView === "server" ? (
              <ServerLeftBar
                serverName="monki"
                categories={mockCategories}
                activeChannelId={activeServerChannelId}
                onSelectChannel={(c) => setActiveServerChannelId(c.id)}
              />
            ) : (
              <LeftBar
                onFriendsClick={() => handleViewChange("friends")}
                onChatChannelClick={handleChatChannelClick}
              />
            )}
            {user && (
              <div className="absolute bottom-[10px] left-0 right-[10px] z-40">
                <ProfileButton user={user} className="w-full" />
              </div>
            )}
          </div>
          <div className="hidden md:flex w-3/5 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0">
              {activeView === "server" ? (
                <Chat
                  personName={`# ${activeServerChannelId}`}
                  userId={user?.id || ""}
                  channelId={activeServerChannelId}
                  hideHeader={true}
                />
              ) : activeView === "friends" ? (
                <FriendsView onOpenChat={handleOpenChatFromFriendList} />
              ) : activeView === "voice" ? (
                <VoiceView />
              ) : !user ? (
                <div className="flex h-full items-center justify-center text-brand-beige">
                  {t("home.loginToChat")}
                </div>
              ) : !activeDmChannelId ? (
                <div className="flex h-full items-center justify-center text-brand-beige">
                  {t("home.selectFriendToChat")}
                </div>
              ) : (
                <Chat
                  personName={activeDmName}
                  userId={user.id}
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
