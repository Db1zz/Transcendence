import React, { useState } from "react";
import { FriendsHeader } from "./FriendsHeader";
import { AddFriendView } from "./AddFriendView";
import { FriendsList } from "./FriendsList";
import { useFriends } from "../hooks/useFriends";

export type FriendsTab = "online" | "all" | "pending" | "blocked" | "add";
export interface Friend {
  id: string;
  name: string;
  username: string;
  picture?: string;
  status: "online" | "idle" | "dnd" | "offline";
  about: string;
  createdAt: string;
  isFriend: "friend" | "pending" | "blocked";
  role: "USER" | "ADMIN";
}

interface FriendsViewProps {
  onOpenChat?: (friend: Friend) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({ onOpenChat }) => {
  const [activeTab, setActiveTab] = useState<FriendsTab>("online");
  const [searchQuery, setSearchQuery] = useState("");

  const { friends, addFriend, acceptFriend, removeFriend, blockUser, unblockUser, refresh } = useFriends();
  const getFiltered = () => {
    let filtered = friends;

    if (activeTab === "online") {
      filtered = friends.filter(
        (f) => f.status !== "offline" && f.isFriend === "friend",
      );
    } else if (activeTab === "pending") {
      filtered = friends.filter((f) => f.isFriend === "pending");
    } else if (activeTab === "blocked") {
      filtered = friends.filter((f) => f.isFriend === "blocked");
    } else if (activeTab === "all") {
      filtered = friends.filter((f) => f.isFriend === "friend");
    }

    if (searchQuery) {
      filtered = filtered.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  };

  const counts = {
    online: friends.filter(
      (f) => f.isFriend === "friend" && f.status !== "offline",
    ).length,
    all: friends.filter((f) => f.isFriend === "friend").length,
    pending: friends.filter((f) => f.isFriend === "pending").length,
    blocked: friends.filter((f) => f.isFriend === "blocked").length,
  };

  return (
    <div className="flex flex-col h-full bg-brand-beige border border-brand-green">
      <FriendsHeader
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); refresh(); }}
        counts={counts}
      />
      <div className="flex-1 overflow-hidden">
        {activeTab === "add" ? (
          <AddFriendView onAddFriend={addFriend} />
        ) : (
          <FriendsList
            friends={getFiltered()}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onMessage={(friend) => onOpenChat?.(friend)}
            onAccept={acceptFriend}
            onRemove={removeFriend}
            onBlock={blockUser}
            onUnblock={unblockUser}
          />
        )}
      </div>
    </div>
  );
};
