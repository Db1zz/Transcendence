import { useEffect, useCallback, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useServers } from "./useServers";
import { StompSubscription, Message } from "@stomp/stompjs";

export const useOrganizationEvents = (
    onEventReceived?: (orgId: string, event: any) => void,
    onInitialStateReceived?: (state: any) => void
) => {
    const { isConnected, subscribe, send } = useSocket();
    const { servers } = useServers();
    
    const subscriptionsRef = useRef<StompSubscription[]>([]);

    useEffect(() => {
        if (!isConnected || !servers || servers.length === 0) {
            return;
        }

        for (const server of servers) {
            const destination = `/topic/organization/${server.id}`;
            
            const sub = subscribe(destination, (message: Message) => {
                try {
                    const event = JSON.parse(message.body);

                    if (onEventReceived) {
                        onEventReceived(server.id, event);
                    }
                } catch (error) {
                    console.error(`Failed to parse event for org ${server.id}`, error);
                }
            });

            if (sub) subscriptionsRef.current.push(sub);
        }

        const initialSyncSub = subscribe("/user/queue/initial-state", (message: Message) => {
            try {
                const state = JSON.parse(message.body);
                if (onInitialStateReceived) {
                    onInitialStateReceived(state);
                }
            } catch (error) {
                console.error("Failed to parse initial state sync", error);
            }
        });

        if (initialSyncSub) subscriptionsRef.current.push(initialSyncSub);
        return () => {
            subscriptionsRef.current.forEach(sub => sub.unsubscribe());
            subscriptionsRef.current = [];
        };
    }, [servers, isConnected, subscribe, onEventReceived, onInitialStateReceived]);

    const sendOrganizationAction = useCallback((orgId: string, action: string, payload: any) => {
        if (!isConnected) {
            console.warn("Cannot send action, socket is not connected.");
            return;
        }
        const destination = `/app/organization/${orgId}/${action}`;
        
        send(destination, JSON.stringify(payload));
    }, [isConnected, send]);

    return {
        sendOrganizationAction
    };
};