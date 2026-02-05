import React, { useState, useRef, useEffect } from "react";
import { Button } from "./Button";

interface Message {
  id: string;
  sender: "user" | "other";
  text: string;
  timestamp: Date;
}

interface ChatProps {
  personName: string;
  onSendMessage?: (message: string) => void;
}

const Chat: React.FC<ChatProps> = ({ personName, onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "other",
      text: "aboba?",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      sender: "user",
      text: "aboba.",
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: "3",
      sender: "other",
      text: "swaga",
      timestamp: new Date(Date.now() - 180000),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        text: inputValue,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
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
        <p className="text-sm text-blue-100">online</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-brand-beige text-gray-600 rounded-br-none"
                  : "bg-brand-peach text-white rounded-bl-none"
              }`}
            >
              <p className="break-words">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === "user"
                    ? "text-brand-green"
                    : "text-gray-500"
                }`}
              >
                {formatTime(message.timestamp)}
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
