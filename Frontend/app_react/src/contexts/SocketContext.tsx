import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { StompSubscription } from "@stomp/stompjs";
import { useAuth } from "./AuthContext";
import { socketService } from "../services/socket/socketService";

interface SocketContextValue {
  isConnected: boolean;
  subscribe: (
    destination: string,
    callback: (payload: any) => void,
  ) => StompSubscription | null;
  send: (destination: string, body: any) => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef<StompSubscription[]>([]);

  useEffect(() => {
    if (!user) {
      socketService.disconnect();
      setIsConnected(false);
      return;
    }

    socketService
      .connect()
      .then(() => {
        setIsConnected(true);
        console.log("Global STOMP socket connected");
      })
      .catch((err: Error) => console.error("STOMP connection failed", err));

    return () => {
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = [];
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [user]);

  const subscribe = (destination: string, callback: (payload: any) => void) => {
    if (!socketService || !isConnected) {
      console.warn(`Cannot subscribe to ${destination} – socket not ready`);
      return null;
    }
    const sub = socketService.subscribe(destination, callback);
    subscriptionsRef.current.push(sub);
    return sub;
  };

  const send = (destination: string, body: any) => {
    if (!socketService || !isConnected) {
      console.warn(`Cannot send to ${destination} – socket not ready`);
      return;
    }
    socketService.send(destination, body);
  };

  return (
    <SocketContext.Provider value={{ isConnected, subscribe, send }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};
