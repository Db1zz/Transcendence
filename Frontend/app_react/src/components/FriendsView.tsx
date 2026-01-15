import React, { useState } from "react"

export type FriendsTab = "online" | "all" | "pending" | "blocked" | "add";

export interface Friend {
    id: string;
    name: string;
    picture?: string;
    status: 'online' | 'idle' | 'dnd' | 'offline';
    about: string;
    createdAt: string;
    isFriend: 'friend' | 'pending' | 'blocked';
    role: 'USER' | 'ADMIN'
};

interface FriendsViewProps {
    friends: Friend[];
}

export const FriendsView: React.FC<FriendsViewProps> = ({
    friends = null
}) => {
    const [activeTab, setActiveTab] = useState<FriendsTab>("online");
    const [searchQuery, setSearchQuery] = useState("");

    const getFiltered = () => {
        if (friends === null) {
            return null
        }

        let filtered = friends;

        if (activeTab === "online") {
            filtered = friends.filter((f) => f.status !== "offline" && f.isFriend === "friend");
        } else if (activeTab === "pending") {
            filtered = friends.filter((f) => f.isFriend === "pending");
        } else if (activeTab === "blocked") {
            filtered = friends.filter((f) => f.isFriend === "blocked");
        }

        if (searchQuery) {
            filtered = filtered.filter(
                (f) =>
                    f.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered
    };

    const onlineFriendsCount = () => {
        if (friends === null) {
            return null
        }

        return friends.filter((f) => f.status !== "offline" && f.isFriend === "friend").length;
    };

    const pendingFriendsCount = () => {
        if (friends === null) {
            return null
        }

        return friends.filter((f) => f.status !== "offline" && f.isFriend === "pending").length;
    };

    const blockedFriendsCount = () => {
        if (friends === null) {
            return null
        }

        return friends.filter((f) => f.status !== "offline" && f.isFriend === "pending").length;
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* friendsheader here */}
            <div className="flex-1 overflow-hidden">
                {activeTab === "add" ? (
                    
                )}
            </div>
        </div>
    )
};