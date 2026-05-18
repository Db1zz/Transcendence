import { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import { useSocket } from "../contexts/SocketContext";

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export const useChat = (channelId: string) => {
  const { isConnected, subscribe, send } = useSocket();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadHistory = useCallback(
    async (pageNumber: number, isActive: boolean = true) => {
      if (!channelId) return;

      try {
        const response = await api.get(
          `/chat/channels/${channelId}/messages?page=${pageNumber}&size=50`,
        );

        if (!isActive) return;

        if (response.data.length < 50) {
          setHasMore(false);
        }

        const fetchedMessages = response.data.reverse();

        setMessages((prev) => {
          if (pageNumber === 0) return fetchedMessages;
          return [...fetchedMessages, ...prev];
        });
      } catch (error) {
        console.error("Failed to load messages", error);
        if (isActive && pageNumber === 0) setMessages([]);
      }
    },
    [channelId],
  );

  useEffect(() => {
    let isActive = true;

    if (channelId) {
      setMessages([]);
      setPage(0);
      setHasMore(true);
      loadHistory(0, isActive);
    }

    return () => {
      isActive = false;
    };
  }, [channelId, loadHistory]);

  useEffect(() => {
    if (!channelId || !isConnected) return;

    const subscription = subscribe(`/topic/chat/${channelId}`, (parsedMessage: ChatMessage) => {
      setMessages((prev) => [...prev, parsedMessage]);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [channelId, isConnected, subscribe]);

  const sendMessage = (content: string, senderId: string) => {
    if (isConnected && content.trim()) {
      send("/app/chat.send", {
        channelId,
      senderId,
        content,
      });
    }
  };

  const loadOlderMessages = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadHistory(nextPage);
    }
  };

  return {
    messages,
    sendMessage,
    connected: isConnected,
    loadOlderMessages,
    hasMore,
  };
};