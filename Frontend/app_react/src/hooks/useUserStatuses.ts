import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";

interface StatusUpdatePayload {
  userId: string;
  status: "online" | "idle" | "dnd" | "offline";
}

export const useUserStatuses = (userId: string) => {
    const { isConnected, subscribe } = useSocket();
    const [statuses, setStatuses] = useState<Record<string, "online" | "idle" | "dnd">>({});

    useEffect(() => {
        if (!isConnected || !userId) {
            return;
        }

        const destination = `/topic/statuses/${userId}`;

        const subscription = subscribe(destination, (payload: StatusUpdatePayload) => {
            setStatuses((prev) => {
                if (payload.status !== "offline") {
                    return {
                        ...prev,
                        [payload.userId]: payload.status,
                    };
                } else {
                    const { [payload.userId]: removedUser, ...rest } = prev;
                    return rest;
                }
            });
        });

		return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [isConnected, subscribe, userId]);

    return { statuses, isSocketReady: isConnected };
}