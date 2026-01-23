"use client";

import { FriendsView } from "./FriendsView";
import { NavigationSidebar } from "./navigation/NavigationSideBar";
import React from "react";
import ProfileButton from "../components/ProfileButton";
import { HeaderBar } from "./navigation/HeaderBar";
import { LeftBar } from "./navigation/LeftBar";
import RightBar from "./navigation/RightBar";

const testUser = {
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
  return (
    <div className="h-full flex flex-col relative">
      <HeaderBar type="friends" />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex w-[72px] z-30 flex-col overflow-hidden">
          <NavigationSidebar />
        </div>
        <main className="flex-1 flex gap-0 p-2 overflow-hidden">
          <div className="w-1/5 flex-shrink-0 overflow-auto">
            <LeftBar />
          </div>
          <div className="w-3/5 overflow-auto">
            <FriendsView />
          </div>
          <div className="w-1/5 flex-shrink-0 overflow-auto">
            <RightBar />
          </div>
        </main>
      </div>
      <div className="fixed bottom-1.5 left-1 z-40">
        <ProfileButton user={testUser} className="w-[400px]" />
      </div>
    </div>
  );
};

export default MainLayout;
