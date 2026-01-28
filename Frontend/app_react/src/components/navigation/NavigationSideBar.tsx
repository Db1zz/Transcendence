"use client";

import React from "react";
import { NavigationItem } from "./NavigationItem";
import { MessageSquare } from "lucide-react";

const MOCK_SERVERS = [
  {
    id: "1",
    name: "monki",
    imageUrl: "https://media.tenor.com/I9qt03YKkjQAAAAe/monkey-thinking.png",
  },
  {
    id: "2",
    name: "goshan4ik",
    imageUrl:
      "https://i.pinimg.com/736x/62/ef/9e/62ef9ed6a92c43292d2e3d67faa62664.jpg",
  },
  {
    id: "3",
    name: "meow",
    imageUrl:
      "https://i.pinimg.com/736x/ad/b4/0a/adb40a610c898a70fb990dc5e224f397.jpg",
  },
];

export const NavigationSidebar = () => {
  return (
    <div className="space-y-4 flex flex-col items-center text-primary w-full bg-brand-green py-3 h-full border-r border-brand-peach overflow-hidden">
      <button className="group relative flex items-center transition-all duration-150">
        <div className="flex h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-brand-beige border border-brand-peach group-hover:border-brand-peach hover:bg-brand-peach shadow-sm hover:shadow-none">
          <MessageSquare
            size={24}
            className="text-brand-green group-hover:text-brand-brick transition-colors duration-200"
          />
        </div>
      </button>
      <div className="h-[2px] bg-brand-peach rounded-md w-10 mx-auto" />
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden">
        {MOCK_SERVERS.map((chat, index) => (
          <div key={chat.id} className="mb-4">
            <NavigationItem
              id={chat.id}
              imageUrl={chat.imageUrl}
              name={chat.name}
              isActive={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
