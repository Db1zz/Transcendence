import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { NotifyClient } from "../services/notifications/client";
import { NotificationToast } from "../components/NotificationToast";
import { BackendNotification } from "../services/notifications/types";

type StoredNotification = BackendNotification & {
  payload: unknown;
};

type NotificationContextType = {
  getUnreadCount: (id: string) => number;
  markAsRead: (id: string) => void;
  latestToast: any | null;
  notifications: StoredNotification[];
  dismissNotification: (id: string) => Promise<void>;
  dismissNotifications: (ids: string[]) => Promise<void>;
  setActiveTarget: (id: string | null) => void;
  setIncomingCall: (call: any | null) => void;
  incomingCall: any | null;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

const parsePayload = (payload: unknown) => {
  if (typeof payload !== "string") return payload;

  try {
    return JSON.parse(payload);
  } catch (error) {
    console.error("Failed to parse notification payload", error);
    return payload;
  }
};

const normalizeNotification = (
  item: BackendNotification,
): StoredNotification => ({
  ...item,
  payload: parsePayload(item.payload),
});

const isMessageNotification = (item: Pick<BackendNotification, "etype">) =>
  item.etype === "MESSAGE_CREATED";

const getTargetId = (item: any) => {
  try {
    const inner =
      typeof item.payload === "string"
        ? JSON.parse(item.payload)
        : item.payload;
    if (
      item.scope === "DM" ||
      item.scope === "SERVER_CHANNEL" ||
      item.scope === "GROUP_CHANNEL"
    ) {
      if (item.etype === "JOIN_CALL_CREATED") {
        return inner.room_id;
      }
      return inner.channel_id;
    }
  } catch (e) {
    console.error("Payload parse error", e);
  }
  return null;
};

export function NotificationProvider({
  children,
  notifyWsAddr,
  
}: {
  children: React.ReactNode;
  notifyWsAddr: string;
}) {
  const { user } = useAuth();

  const [unreadIds, setUnreadIds] = useState<Record<string, string[]>>({});
  const [latestToast, setLatestToast] = useState<any | null>(null);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);

  const activeTargetRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  const client = useMemo(() => {
    if (!user?.id) return undefined;
    return new NotifyClient(notifyWsAddr);
  }, [notifyWsAddr, user?.id]);

  useEffect(() => {
    if (!client) return;

    const initialize = async () => {
      const token = await client.start();
      if (!token) return;
      tokenRef.current = token;

      const offlineData = await client.fetchOfflineNotifications(token);
      const historicalIds: Record<string, string[]> = {};
      const storedNotifications = offlineData
        .filter((item) => !isMessageNotification(item))
        .map((item) => normalizeNotification(item));

      offlineData.forEach((item) => {
        const targetId = getTargetId(item);
        if (targetId && targetId !== activeTargetRef.current) {
          if (!historicalIds[targetId]) historicalIds[targetId] = [];
          historicalIds[targetId].push(item.id);
        }
      });

      setUnreadIds(historicalIds);
      setNotifications(storedNotifications);
    };

    client.onMessageReceived = (event: any) => {
      const normalizedEvent = normalizeNotification(event);

      if (!isMessageNotification(event)) {
        setNotifications((prev) => {
          if (prev.some((item) => item.id === event.id)) {
            return prev;
          }

          return [normalizedEvent, ...prev];
        });
      }

      if (event.etype === "JOIN_CALL_CREATED") {
        setIncomingCall(event);
        return;
      }

      const targetId = getTargetId(event);
      if (!targetId) return;

      if (!isMessageNotification(event)) {
        return;
      }

      if (targetId === activeTargetRef.current) {
        if (tokenRef.current) {
          client.markNotificationsAsRead(tokenRef.current, [event.id]);
        }
        return;
      }

      setUnreadIds((prev) => {
        const next = { ...prev };
        if (!next[targetId]) next[targetId] = [];
        if (!next[targetId].includes(event.id)) {
          next[targetId] = [...next[targetId], event.id];
        }
        return next;
      });

      const toastData = {
        ...event,
        payload:
          typeof event.payload === "string"
            ? JSON.parse(event.payload)
            : event.payload,
      };
      setLatestToast(toastData);
      setTimeout(() => setLatestToast(null), 5000);
    };

    initialize();
    return () => client.stop();
  }, [client]);

  const getUnreadCount = (id: string) => unreadIds[id]?.length || 0;

  const markAsRead = async (id: string) => {
    const idsToMark = unreadIds[id];
    if (!idsToMark || idsToMark.length === 0) return;

    const validDbIds = idsToMark.filter(
      (notifId) => !notifId.startsWith("live-"),
    );

    setUnreadIds((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    if (validDbIds.length > 0 && tokenRef.current) {
      await client?.markNotificationsAsRead(tokenRef.current, validDbIds);
    }
  };

  const setActiveTarget = (id: string | null) => {
    activeTargetRef.current = id;
    if (id) {
      markAsRead(id);
    }
  };

  const dismissNotifications = async (ids: string[]) => {
    const uniqueIds = Array.from(new Set(ids)).filter(Boolean);

    if (uniqueIds.length === 0) {
      return;
    }

    setNotifications((prev) =>
      prev.filter((item) => !uniqueIds.includes(item.id)),
    );

    if (tokenRef.current) {
      await client?.markNotificationsAsRead(tokenRef.current, uniqueIds);
    }
  };

  const dismissNotification = async (id: string) => {
    await dismissNotifications([id]);
  };

  return (
    <NotificationContext.Provider
      value={{
        getUnreadCount,
        markAsRead,
        latestToast,
        notifications,
        dismissNotification,
        dismissNotifications,
        setActiveTarget,
        setIncomingCall,
        incomingCall,
      }}
    >
      {children}

      {latestToast && (
        <div className="fixed bottom-5 right-5 z-[100] animate-in slide-in-from-right-10">
          <NotificationToast
            payload={latestToast.payload}
            onClose={() => setLatestToast(null)}
          />
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotifications