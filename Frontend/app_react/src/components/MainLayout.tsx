"use client";

import { FriendsView } from "./FriendsView";
import { NavigationSidebar } from "./navigation/NavigationSideBar";
import React from "react";
import ProfileButton from "../components/ProfileButton";
import { HeaderBar } from "./navigation/HeaderBar";

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
    <div className="h-full flex flex-col relative bg-brand-beige">
      <HeaderBar type="friends" />
      <div className="flex flex-1">
        <div className="hidden md:flex w-[72px] z-30 flex-col fixed inset-y-[30px] left-0">
          <NavigationSidebar />
        </div>
        <main className="md:pl-[72px] flex-1 flex flex-col">{children}</main>
      </div>
      <div className="flex flex-col gap-4 items-center">
        <FriendsView></FriendsView>
      </div>
      <div className="fixed bottom-1.5 left-1 z-40">
        <ProfileButton user={testUser} className="w-[400px]" />
      </div>
    </div>
  );
};

export default MainLayout;
