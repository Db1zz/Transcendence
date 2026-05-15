import { useEffect, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import api from "../utils/api";

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export const useChat = (channelId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);
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
    if (!channelId) return;

    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws",
      onConnect: () => {
        setConnected(true);
        stompClient.subscribe(
          `/topic/chat/${channelId}`,
          (message: { body: string }) => {
            const parsed = JSON.parse(message.body);
            setMessages((prev) => [...prev, parsed]);
          },
        );
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [channelId]);

  const sendMessage = (content: string, senderId: string) => {
    if (client?.connected && content.trim()) {
      client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          channelId,
          senderId,
          content,
        }),
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
    connected,
    loadOlderMessages,
    hasMore,
  };
};
