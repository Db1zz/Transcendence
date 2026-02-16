import React, { useState, useRef, useEffect } from "react";
import { Button } from "./Button";
import { useChat, ChatMessage } from "../hooks/useChat";

interface ChatProps {
  personName: string;
  userId: string;
  roomId: string;
  onSendMessage?: (message: string) => void;
}

const Chat: React.FC<ChatProps> = ({
  personName,
  userId,
  roomId,
  onSendMessage,
}) => {
  const { messages: wsMessages, sendMessage, connected } = useChat(roomId);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [wsMessages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue, userId);
      setInputValue("");
      onSendMessage?.(inputValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full min-h-0  bg-brand-green">
      <div className="bg-brand-peach border-y border-brand-green text-white p-4 shadow-md">
        <h2 className="text-xl font-bold">{personName}</h2>
        <p
          className={`text-sm ${connected ? "text-green-100" : "text-red-100"}`}
        >
          {connected ? "online" : "connecting..."}
        </p>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-4 space-y-4"
      >
        {wsMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === userId
                  ? "bg-brand-beige text-gray-600 rounded-br-none"
                  : "bg-brand-peach text-white rounded-bl-none"
              }`}
            >
              <p className="break-words">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.senderId === userId
                    ? "text-brand-green"
                    : "text-gray-500"
                }`}
              >
                {formatTime(new Date(message.createdAt))}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-300 p-4 bg-brand-green">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="type a message..."
            className=" bg-brand-beige flex-1 p-3 border border-brand-peach rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brick resize-none max-h-24"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            className="mb-1.5 bg-brand-peach text-brand-brick"
          >
            send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
