import React, { useState } from "react";
import { UserPlus, Sparkles } from "lucide-react";
import { Button } from "./Button";

export const AddFriendView: React.FC = () => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = () => {
    if (name.trim()) {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setName("");
      }, 3000);
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="font-ananias font-bold text-xl text-gray-800 uppercase mb-2">
          Add Friend
        </h2>
        <p className="font-roboto text-sm text-muted-foreground">
          you can add friends with their 'names'.
        </p>
      </div>
      <div className="mb-8">
        <div
          className={`flex items-center gap-2 p-1 bg-brand-green border-2 rounded-lg shadow-sharp-sm transition-all duration-150
                    ${status === "success" ? "border-green-600 ring-1 ring-green-600" : status === "error" ? "border-red-500 ring-1 ring-red-500" : "border-gray-800 focus-within:ring-2 focus-within:ring-brand-brick"}
                `}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit}
            placeholder="enter a name"
            className="flex-1 px-4 py-3 bg-transparent font-roboto text-gray-800 placeholder:text-gray-600 focus:outline-none"
          />
          <Button
            onClick={handleSubmit}
            color={
              isValid
                ? "bg-brand-brick"
                : "bg-brand-brick hover:bg-brand-peach hover:text-brand-brick cursor-not-allowed shadow-none p-4 hover:-translate-y-[2px]"
            }
            className={`m-2 mb-3 !px-6 !py-3 !text-sm whitespace-nowrap flex items-center gap-2`}
          >
            <UserPlus className="w-4 h-4" />
            <span>send request</span>
          </Button>
        </div>
        {status === "success" && (
          <p className="mt-3 font-roboto text-sm text-green-600 animate-fade-in">
            Friend request successfuly sent to <strong>{name}</strong>.
          </p>
        )}
        {status === "error" && (
          <p className="mt-3 font-roboto text-sm text-red-500 animate-fade-in">
            There are no users with such name.
          </p>
        )}
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-200 border-2 border-gray-800 flex items-center justify-center mb-4 shadow-sharp-md">
          <Sparkles className="w-12 h-12 text-brand-brick" />
        </div>
        <h3 className="font-ananias font-bold text-lg text-gray-800 mb-2">
          wau
        </h3>
      </div>
    </div>
  );
};
