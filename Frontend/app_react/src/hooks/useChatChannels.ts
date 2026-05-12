import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";

export interface ChatChannel {
  channelId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPicture: string;
}

export const useChatChannels = () => {
  const { user } = useAuth();
  const [chatChannels, setChatChannels] = useState<ChatChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChatChannels = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setChatChannels([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/chat/channels");
      setChatChannels(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setChatChannels([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchChatChannels();
  }, [fetchChatChannels]);

  return { chatChannels, loading, error, refetch: fetchChatChannels };
};
