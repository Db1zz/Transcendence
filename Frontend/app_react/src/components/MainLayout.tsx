"use client";

import { FriendsView } from "./FriendsView";
import { NavigationSidebar } from "./navigation/NavigationSideBar";
import Chat from "./Chat";
import React, { useState, useEffect } from "react";
import ProfileButton from "../components/ProfileButton";
import { HeaderBar } from "./navigation/HeaderBar";
import { LeftBar } from "./navigation/LeftBar";
import RightBar from "./navigation/RightBar";

const testUser = {
  id: "42",
  name: "kaneki",
  email: "example@example.com",
  picture: "https://media.tenor.com/I9qt03YKkjQAAAAe/monkey-thinking.png",
  status: "online" as const,
  role: "ADMIN" as const,
  about: "privet",
  createdAt: "2023-12-20T10:00:00Z",
};

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [activeView, setActiveView] = useState<"friends" | "chat">("friends");

  useEffect(() => {
    const savedView = localStorage.getItem("activeView") as
      | "friends"
      | "chat"
      | null;
    if (savedView) {
      setActiveView(savedView);
    }
  }, []);

  const handleViewChange = (view: "friends" | "chat") => {
    setActiveView(view);
    localStorage.setItem("activeView", view);
  };
  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <HeaderBar type="friends" />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex w-[72px] z-30 flex-col overflow-hidden">
          <NavigationSidebar
            onChatClick={() => handleViewChange("chat")}
            onFriendsClick={() => handleViewChange("friends")}
          />
        </div>
        <main className="flex-1 flex gap-0 pt-2 pl-2 pr-0 md:p-2 overflow-hidden relative min-h-0">
          <div className="absolute inset-0 bg-brand-green opacity-80 -z-10"></div>
          <div className="w-full md:w-1/5 flex-shrink-0 overflow-hidden">
            <LeftBar onFriendsClick={() => handleViewChange("friends")} />
          </div>
          <div className="hidden md:flex w-3/5 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0">
              {activeView === "friends" ? (
                <FriendsView />
              ) : (
                <Chat
                  personName={testUser.name}
                  userId={testUser.id}
                  roomId="global"
                />
              )}
            </div>
          </div>
          <div className="hidden lg:block w-1/5 flex-shrink-0 overflow-hidden">
            <RightBar />
          </div>
        </main>
      </div>
      <div className="fixed bottom-[15px] left-1 right-1 z-40 md:left-1 md:right-auto md:w-auto">
        <ProfileButton user={testUser} className="w-full md:w-[386px]" />
      </div>
    </div>
  );
};

export default MainLayout;
