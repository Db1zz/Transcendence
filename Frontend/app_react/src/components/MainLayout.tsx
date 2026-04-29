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
import { useCallContext } from "../contexts/CallContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ServerLeftBar, ChannelCategory } from "./ServerLeftBar";
import { ServerHeader } from "./ServerHeader";
import { MemberList, Member } from "./MemberList";

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
  const { activeCall } = useCallContext();

  const [selectedChatFriend, setSelectedChatFriend] = useState<Friend | null>(
    null,
  );
  const [selectedChatUser, setSelectedChatUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [, setActiveServerId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string>("general");

  const { user, loading } = useAuth();

  useEffect(() => {
    const savedView = localStorage.getItem("activeView") as
      | "friends"
      | "chat"
      | "voice"
      | "server"
      | null;
    if (savedView) setActiveView(savedView);
  }, []);

  useEffect(() => {
    if (activeCall) setActiveView("voice");
  }, [activeCall]);

  const handleViewChange = (view: "friends" | "chat" | "voice" | "server") => {
    setActiveView(view);
    localStorage.setItem("activeView", view);
  };

  const handleOpenChat = (friend: Friend) => {
    setSelectedChatFriend(friend);
    setSelectedChatUser(null);
    handleViewChange("chat");
  };

  const handleChatRoomClick = (userId: string, userName: string) => {
    setSelectedChatUser({ id: userId, name: userName });
    setSelectedChatFriend(null);
    handleViewChange("chat");
  };

  const handleServerClick = (serverId: string) => {
    setActiveServerId(serverId);
    handleViewChange("server");
  };

  const createDmRoomId = (userId: string, friendId: string) => {
    const [first, second] = [userId, friendId].sort();
    return `dm-${first}-${second}`;
  };

  if (loading) return null;

  const chatUserId = user?.id ?? "";
  const chatFriendId = selectedChatFriend?.id ?? selectedChatUser?.id;
  const chatRoomId =
    user && chatFriendId ? createDmRoomId(user.id, chatFriendId) : null;
  const chatPersonName =
    selectedChatFriend?.name ?? selectedChatUser?.name ?? "";

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {activeView === "server" ? (
        <ServerHeader channelName={activeChannelId} />
      ) : (
        <HeaderBar type={activeView === "chat" ? "messages" : "friends"} />
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex w-[72px] z-30 flex-col overflow-hidden">
          <NavigationSidebar
            onChatClick={() => handleViewChange("chat")}
            onFriendsClick={() => handleViewChange("friends")}
            onServerClick={(id) => handleServerClick(id)}
          />
        </div>
        <main className="flex-1 flex gap-0 pt-2 pl-2 pr-0 md:p-2 overflow-hidden relative min-h-0">
          <div className="absolute inset-0 bg-brand-green opacity-80 -z-10"></div>
          <div className="w-full md:w-1/5 flex-shrink-0 overflow-hidden relative">
            {activeView === "server" ? (
              <ServerLeftBar
                serverName="monki"
                categories={mockCategories}
                activeChannelId={activeChannelId}
                onSelectChannel={(c) => setActiveChannelId(c.id)}
              />
            ) : (
              <LeftBar
                onFriendsClick={() => handleViewChange("friends")}
                onChatRoomClick={handleChatRoomClick}
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
                  personName={`# ${activeChannelId}`}
                  userId={user?.id || ""}
                  roomId={`channel-${activeChannelId}`}
                  hideHeader={true}
                />
              ) : activeView === "friends" ? (
                <FriendsView onOpenChat={handleOpenChat} />
              ) : activeView === "voice" ? (
                <VoiceView />
              ) : !user ? (
                <div className="flex h-full items-center justify-center text-brand-beige">
                  {t("home.loginToChat")}
                </div>
              ) : !chatRoomId ? (
                <div className="flex h-full items-center justify-center text-brand-beige">
                  {t("home.selectFriendToChat")}
                </div>
              ) : (
                <Chat
                  personName={chatPersonName}
                  userId={chatUserId}
                  roomId={chatRoomId}
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
    </div>
  );
};

export default MainLayout;
