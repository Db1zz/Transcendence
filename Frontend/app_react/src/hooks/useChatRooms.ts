import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";

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

  const fetchChatRooms = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setChatRooms([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/chat/rooms");
      setChatRooms(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  return { chatRooms, loading, error, refetch: fetchChatRooms };
};
