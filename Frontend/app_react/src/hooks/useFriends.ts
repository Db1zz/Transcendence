import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Friend } from "../components/FriendsView";

export const useFriends = () => {
  const { user, logout } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    // const token = localStorage.getItem("accessToken");
    const headers: any = {
      "Content-type": "application/json",
    };
    // if (token && token !== "null" && token !== "undefined") {
    //     headers["Authorization"] = `Bearer ${token}`;
    // }
    console.log(`USER ID IS: ${user?.id}`);
    if (user?.id) {
      headers["X-User-Id"] = user.id;
    }

    return headers;
  };

  const fetchFriends = useCallback(async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const headers = getHeaders();

      const [friendsRes, pendingRes, blockedRes] = await Promise.all([
        fetch("http://localhost:8080/api/friends", { headers }),
        fetch("http://localhost:8080/api/friends/requests", { headers }),
        fetch("http://localhost:8080/api/friends/blocked", { headers }),
      ]);

      if (friendsRes.status === 401) {
        logout();
        return;
      }

      const friendsData = await friendsRes.json();
      const pendingData = pendingRes.ok ? await pendingRes.json() : [];
      const blockedData = blockedRes.ok ? await blockedRes.json() : [];

      const allFriends = [
        ...friendsData.map((f: any) => mapToFrontend(f, "friend")),
        ...pendingData.map((f: any) => mapToFrontend(f, "pending")),
        ...blockedData.map((f: any) => mapToFrontend(f, "blocked")),
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
  ): Friend => ({
    id: data.id,
    name: data.displayName,
    username: data.username,
    picture: data.picture,
    status: "online",
    about: data.about || "",
    createdAt: "",
    isFriend: type,
    role: "USER",
  });

  const addFriend = async (username: string) => {
    const headers = getHeaders();
    const searchRes = await fetch(
      `http://localhost:8080/api/users/public/${username}`,
      { headers },
    );
    if (!searchRes.ok) throw new Error("User not found");

    const users = await searchRes.json();
    if (users.length === 0) throw new Error("User not found");
    const targetId = users[0].id;

    const res = await fetch(`http://localhost:8080/api/friends/${targetId}`, {
      method: "POST",
      headers,
    });
    if (!res.ok) throw new Error("Failed to send request");

    fetchFriends();
  };

  const acceptFriend = async (id: string) => {
    await fetch(`http://localhost:8080/api/friends/${id}`, {
      method: "PUT",
      headers: getHeaders(),
    });
    fetchFriends();
  };

  const removeFriend = async (id: string) => {
    await fetch(`http://localhost:8080/api/friends/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    fetchFriends();
  };

  const blockUser = async (id: string) => {
    await fetch(`http://localhost:8080/api/friends/${id}/block`, {
      method: "POST",
      headers: getHeaders(),
    });
    fetchFriends();
  };

  const unblockUser = async (id: string) => {
    await fetch(`http://localhost:8080/api/friends/${id}/block`, {
      method: "DELETE",
      headers: getHeaders(),
    });
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
