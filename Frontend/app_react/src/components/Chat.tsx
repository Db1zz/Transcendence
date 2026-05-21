import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { useChat } from "../hooks/useChat";
import BackButton from "./BackButton";

interface ChatProps {
  personName: string;
  userId: string;
  channelId: string;
  onSendMessage?: (message: string) => void;
  onBack?: () => void;
  hideHeader?: boolean;
}

const Chat: React.FC<ChatProps> = ({
  personName,
  userId,
  channelId,
  onSendMessage,
  onBack,
  hideHeader = false,
}) => {
  const { t } = useTranslation();

  const {
    messages: wsMessages,
    sendMessage,
    connected,
    loadOlderMessages,
    hasMore,
  } = useChat(channelId);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (container.scrollTop === 0 && hasMore) {
      prevScrollHeightRef.current = container.scrollHeight;
      loadOlderMessages();
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (prevScrollHeightRef.current > 0) {
      container.scrollTop =
        container.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    } else {
      container.scrollTop = container.scrollHeight;
    }
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
    <div className="flex flex-col h-full min-h-0 w-full bg-brand-green">
      {!hideHeader && (
        <div className="bg-brand-peach border-y border-brand-green text-white p-3 sm:p-4 shadow-md">
          <div className="flex items-start gap-3">
            {onBack && (
              <BackButton onClick={onBack} className="md:hidden mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">
                {personName}
              </h2>
              <p
                className={`text-sm ${connected ? "text-green-100" : "text-red-100"}`}
              >
                {connected ? t("chat.connected") : t("chat.connecting")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-4 space-y-4"
      >
        {hasMore && wsMessages.length > 0 && (
          <div className="text-center text-xs text-brand-beige opacity-50 my-2">
            Loading...
          </div>
        )}

        {wsMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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

      <div className="border-t border-gray-300 p-3 sm:p-4 bg-brand-green">
        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("chat.inputPlaceholder")}
            className="bg-brand-beige flex-1 p-3 border border-brand-peach rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brick resize-none max-h-28 min-h-11"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-brand-peach text-brand-brick w-full sm:w-auto sm:self-end"
          >
            {t("chat.send")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
