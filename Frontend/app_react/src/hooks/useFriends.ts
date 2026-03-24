import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Friend } from "../components/FriendsView";
import api from "../utils/api";

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      const [friendsRes, pendingRes, sentPendingRes, blockedRes] =
        await Promise.all([
          api.get("/friends"),
          api.get("/friends/requests"),
          api.get("/friends/requests/sent"),
          api.get("/friends/blocked"),
        ]);

      const allFriends = [
        ...friendsRes.data.map((f: any) => mapToFrontend(f, "friend")),
        ...pendingRes.data.map((f: any) => mapToFrontend(f, "pending", true)),
        ...sentPendingRes.data.map((f: any) =>
          mapToFrontend(f, "pending", false),
        ),
        ...blockedRes.data.map((f: any) => mapToFrontend(f, "blocked")),
      ];

      setFriends(allFriends);
    } catch (error) {
      console.log("Failed to fetch friends", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const mapToFrontend = (
    data: any,
    type: "friend" | "pending" | "blocked",
    canAcceptPending?: boolean,
  ): Friend => ({
    id: data.id,
    name: data.displayName,
    username: data.username,
    picture: data.picture,
    status: "online",
    about: data.about || "",
    createdAt: data.createdAt || "",
    isFriend: type,
    canAcceptPending,
    role: "USER",
  });

  const addFriend = async (username: string) => {
    try {
      const searchRes = await api.get(`/users/public/${username}`);
      const targetId = searchRes.data[0].id;

      await api.post(`/friends/${targetId}`);
      fetchFriends();
    } catch (error) {
      console.error(error);
      throw new Error("Failed to send request");
    }
  };

  const acceptFriend = async (id: string) => {
    await api.put(`/friends/${id}`);
    fetchFriends();
  };

  const removeFriend = async (id: string) => {
    await api.delete(`/friends/${id}`);
    fetchFriends();
  };

  const blockUser = async (id: string) => {
    await api.post(`/friends/${id}/block`);
    fetchFriends();
  };

  const unblockUser = async (id: string) => {
    await api.delete(`/friends/${id}/block`);
    fetchFriends();
  };

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return {
    friends,
    loading,
    addFriend,
    acceptFriend,
    removeFriend,
    blockUser,
    unblockUser,
    refresh: fetchFriends,
  };
};
