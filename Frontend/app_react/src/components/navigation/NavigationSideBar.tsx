"use client";

import React from "react";
import { NavigationItem } from "./NavigationItem";

const MOCK_DMS = [
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
    <div className="space-y-4 flex flex-col items-center text-primary w-full bg-brand-green py-3 h-full">
      <div className="h-[2px] bg-brand-green dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <div className="flex-1 w-full overflow-y-auto">
        {MOCK_DMS.map((chat, index) => (
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
