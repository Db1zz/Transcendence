import React, { useState } from "react";
import { FriendsHeader } from "./FriendsHeader";
import { AddFriendView } from "./AddFriendView";
import { FriendsList } from "./FriendsList";

export type FriendsTab = "online" | "all" | "pending" | "blocked" | "add";

const placeholderFriends: Friend[] = [
  {
    id: "1",
    name: "grisha",
    picture:
      "https://i.etsystatic.com/40574730/r/il/cc7a16/4592422959/il_570xN.4592422959_7mbc.jpg",
    status: "online",
    about: "go adept",
    createdAt: "2023-12-20",
    isFriend: "friend",
    role: "ADMIN",
  },
  {
    id: "2",
    name: "marrianna",
    status: "idle",
    picture:
      "https://i.pinimg.com/1200x/e4/d8/fe/e4d8fe2973ae5daaac0d3f09c1edab6f.jpg",
    about: "kotlin enjoyer",
    createdAt: "2024-01-05",
    isFriend: "friend",
    role: "USER",
  },
  {
    id: "3",
    name: "gosha",
    picture:
      "https://i.pinimg.com/736x/62/ef/9e/62ef9ed6a92c43292d2e3d67faa62664.jpg",
    status: "offline",
    about: "java #1 fan",
    createdAt: "2024-02-15",
    isFriend: "pending",
    role: "USER",
  },
  {
    id: "4",
    name: "alicia",
    status: "offline",
    picture:
      "https://i.pinimg.com/736x/ad/b4/0a/adb40a610c898a70fb990dc5e224f397.jpg",
    about: "c++02 victim",
    createdAt: "2023-11-01",
    isFriend: "friend",
    role: "USER",
  },
  {
    id: "5",
    name: "?",
    picture:
      "https://i.pinimg.com/736x/23/dc/d3/23dcd3b40058a26b3c872397b3ae5658.jpg",
    status: "online",
    about: "i don't want to offend anyone",
    createdAt: "2023-10-10",
    isFriend: "blocked",
    role: "USER",
  },
];

export interface Friend {
  id: string;
  name: string;
  picture?: string;
  status: "online" | "idle" | "dnd" | "offline";
  about: string;
  createdAt: string;
  isFriend: "friend" | "pending" | "blocked";
  role: "USER" | "ADMIN";
}

export const FriendsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FriendsTab>("online");
  const [searchQuery, setSearchQuery] = useState("");

  const getFiltered = () => {
    let filtered = placeholderFriends;

    if (activeTab === "online") {
      filtered = placeholderFriends.filter(
        (f) => f.status !== "offline" && f.isFriend === "friend",
      );
    } else if (activeTab === "pending") {
      filtered = placeholderFriends.filter((f) => f.isFriend === "pending");
    } else if (activeTab === "blocked") {
      filtered = placeholderFriends.filter((f) => f.isFriend === "blocked");
    } else if (activeTab === "all") {
      filtered = placeholderFriends.filter((f) => f.isFriend === "friend");
    }

    if (searchQuery) {
      filtered = filtered.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  };

  const counts = {
    online: placeholderFriends.filter(
      (f) => f.isFriend === "friend" && f.status !== "offline",
    ).length,
    all: placeholderFriends.filter((f) => f.isFriend === "friend").length,
    pending: placeholderFriends.filter((f) => f.isFriend === "pending").length,
    blocked: placeholderFriends.filter((f) => f.isFriend === "blocked").length,
  };

  return (
    <div className="flex flex-col h-full bg-brand-beige">
      <FriendsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />
      <div className="flex-1 overflow-hidden">
        {activeTab === "add" ? (
          <AddFriendView />
        ) : (
          <FriendsList
            friends={getFiltered()}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
          />
        )}
      </div>
    </div>
  );
};
