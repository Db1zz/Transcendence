import React, { useMemo, useState } from "react";
import { FriendsHeader } from "./FriendsHeader";
import { AddFriendView } from "./AddFriendView";
import { FriendsList } from "./FriendsList";
import { useFriends } from "../hooks/useFriends";
import { useCall } from "../hooks/useCall";
import { useAuth } from "../contexts/AuthContext";

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
  canAcceptPending?: boolean;
  role: "USER" | "ADMIN";
}

interface FriendsViewProps {
  onOpenChat?: (friend: Friend) => void;
  statuses?: Record<string, "online" | "idle" | "dnd">;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  onOpenChat,
  statuses,
}) => {
  const [activeTab, setActiveTab] = useState<FriendsTab>("online");
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useAuth();
  const { joinOrCreateRoom } = useCall();

  const {
    friends,
    addFriend,
    acceptFriend,
    removeFriend,
    blockUser,
    unblockUser,
    refresh,
  } = useFriends();

  const updatedFriends = useMemo<Friend[]>(() => {
    if (!statuses) {
      return friends;
    }

    return friends.map((friend) => {
      return {
        ...friend,
        status: statuses[friend.id] ?? "offline",
      };
    });
  }, [friends, statuses]);

  const filteredFriends = useMemo(() => {
    let filtered = updatedFriends;
    console.log(updatedFriends);

    switch (activeTab) {
      case "online":
        filtered = updatedFriends.filter(
          (f) => f.isFriend === "friend" && f.status !== "offline",
        );
        break;
      case "all":
        filtered = updatedFriends.filter((f) => f.isFriend === "friend");
        break;
      case "pending":
        filtered = updatedFriends.filter((f) => f.isFriend === "pending");
        break;
      case "blocked":
        filtered = updatedFriends.filter((f) => f.isFriend === "blocked");
        break;
      case "add":
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((f) => f.name.toLowerCase().includes(q));
    }

    return filtered;
  }, [updatedFriends, activeTab, searchQuery]);

  const counts = useMemo(
    () => ({
      online: updatedFriends.filter(
        (f) => f.isFriend === "friend" && f.status !== "offline",
      ).length,
      all: updatedFriends.filter((f) => f.isFriend === "friend").length,
      pending: updatedFriends.filter((f) => f.isFriend === "pending").length,
      blocked: updatedFriends.filter((f) => f.isFriend === "blocked").length,
    }),
    [updatedFriends],
  );

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-brand-beige border-0 md:border md:border-brand-green">
      <FriendsHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          refresh();
        }}
        counts={counts}
      />

      <div className="flex-1 overflow-hidden">
        {activeTab === "add" ? (
          <AddFriendView onAddFriend={addFriend} />
        ) : (
          <FriendsList
            friends={filteredFriends}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onMessage={(friend) => onOpenChat?.(friend)}
            onAccept={acceptFriend}
            onRemove={removeFriend}
            onBlock={blockUser}
            onUnblock={unblockUser}
            onCall={joinOrCreateRoom}
          />
        )}
      </div>
    </div>
  );
};
