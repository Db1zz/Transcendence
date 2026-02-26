import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export interface ChatRoom {
  roomId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPicture: string;
}

export const useChatRooms = () => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChatRooms = async () => {
    if (!user?.id) {
      setLoading(false);
      setChatRooms([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers: any = {
        "Content-Type": "application/json",
      };

      if (user.id) {
        headers["X-User-Id"] = user.id;
      }

      const response = await fetch("http://localhost:8080/api/chat/rooms", {
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chat rooms");
      }

      const data = (await response.json()) as ChatRoom[];
      setChatRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, [user?.id]);

  return { chatRooms, loading, error, refetch: fetchChatRooms };
};
