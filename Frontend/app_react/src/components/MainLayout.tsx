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
    <div className="min-h-screen flex flex-col relative">
      <HeaderBar type="friends" />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-[72px] z-30 flex-col overflow-hidden">
          <NavigationSidebar />
        </div>
        <main className="flex-1 flex gap-0 pt-2 pl-2 pr-0 md:p-2 overflow-hidden relative">
          <div className="absolute inset-0 bg-brand-green opacity-80 -z-10"></div>
          <div className="w-full md:w-1/5 flex-shrink-0 overflow-auto">
            <LeftBar />
          </div>
          <div className="hidden md:block w-3/5 overflow-auto">
            <FriendsView />
          </div>
          <div className="hidden lg:block w-1/5 flex-shrink-0 overflow-auto">
            <RightBar />
          </div>
        </main>
      </div>
      <div className="hidden md:block md:fixed bottom-1.5 left-1 z-40">
        <ProfileButton user={testUser} className="w-[390px]" />
      </div>
    </div>
  );
};

export default MainLayout;
