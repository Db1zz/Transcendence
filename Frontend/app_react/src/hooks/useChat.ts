import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadHistory = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/chat/rooms/${roomId}/messages`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ChatMessage[];
        if (isActive) {
          setMessages(data);
        }
      } catch (error) {
        if (isActive) {
          setMessages([]);
        }
      }
    };

    setMessages([]);
    loadHistory();

    return () => {
      isActive = false;
    };
  }, [roomId]);

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws",
      onConnect: () => {
        setConnected(true);
        stompClient.subscribe(
          `/topic/chat/${roomId}`,
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
  }, [roomId]);

  const sendMessage = (content: string, senderId: string) => {
    if (client?.connected && content.trim()) {
      client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          roomId,
          senderId,
          content,
        }),
      });
    }
  };

  return { messages, sendMessage, connected };
};
