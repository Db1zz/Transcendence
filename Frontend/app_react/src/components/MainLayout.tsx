"use client";

import { FriendsView } from "./FriendsView";
import { NavigationSidebar } from "./navigation/NavigationSideBar";
import React from "react";
import ProfileButton from "../components/ProfileButton";

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
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <main className="md:pl-[72px] h-full flex-1 flex flex-col">
        {children}
      </main>
      <div className="flex flex-col gap-4 items-center">
        <FriendsView></FriendsView>
      </div>
      <div className="fixed bottom-1.5 left-1 z-40">
        <ProfileButton user={testUser} className="w-[280px]" />
      </div>
    </div>
  );
};

export default MainLayout;
