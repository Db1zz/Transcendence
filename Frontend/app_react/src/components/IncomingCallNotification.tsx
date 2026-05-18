import React, { useMemo } from "react";
import { Phone, PhoneOff, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { useFriends } from "../hooks/useFriends";

interface CallPayload {
  room_id: string;
  sender_id: string;
  user_id: string;
}

interface IncomingCallNotificationProps {
  event: {
    id: string;
    etype: string;
    payload: string;
  };
  onAnswer: (roomId: string) => void;
  onReject: () => void;
}

export const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({
  event,
  onAnswer,
  onReject,
}) => {
  const { t } = useTranslation();
  const { friends } = useFriends();
  const callData = useMemo(() => {
    try {
      return JSON.parse(event.payload) as CallPayload;
    } catch (e) {
      console.error("Failed to parse call payload", e);
      return null;
    }
  }, [event.payload]);

  const caller = useMemo(() => {
    return friends.find((f) => f.id === callData?.sender_id);
  }, [friends, callData]);

if (!callData) return null;

  return (
    <div className="fixed top-1/2 left-1/2 z-50 w-80 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-brand-peach border-4 border-gray-800 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] p-4 flex flex-col gap-4">
        
        <div className="flex items-center gap-3 border-b-2 border-gray-800 pb-3">
          <div className="relative">
            {caller?.picture ? (
              <img
                src={caller.picture}
                alt={caller.name}
                className="w-12 h-12 border-2 border-gray-800 object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-brand-beige border-2 border-gray-800 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-800" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-green border-2 border-gray-800 rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-ananias font-bold text-gray-800 uppercase text-sm tracking-tight">
              {t("voice.incomingCall")}
            </span>
            <span className="font-roboto font-black text-lg text-gray-900 truncate max-w-[160px]">
              {caller?.name || t("voice.unknownCaller")}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => onAnswer(callData.room_id)}
            color="bg-brand-green"
            className="flex-1 flex items-center justify-center gap-2 !py-2 border-2 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <Phone className="w-4 h-4 fill-current" />
          </Button>

          <Button
            onClick={onReject}
            color="bg-brand-brick"
            className="flex-1 flex items-center justify-center gap-2 !py-2 border-2 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <PhoneOff className="w-4 h-4 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
};