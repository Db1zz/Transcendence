import { useEffect, useCallback, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useServers } from "./useServers";
import { StompSubscription } from "@stomp/stompjs";

export const useOrganizationEvents = (
    onEventReceived?: (orgId: string, event: any) => void,
    onInitialStateReceived?: (state: any) => void
) => {
    const { isConnected, subscribe, send } = useSocket();
    const { servers } = useServers();
    
    const onEventReceivedRef = useRef(onEventReceived);
    const onInitialStateReceivedRef = useRef(onInitialStateReceived);

    useEffect(() => {
        onEventReceivedRef.current = onEventReceived;
        onInitialStateReceivedRef.current = onInitialStateReceived;
    }, [onEventReceived, onInitialStateReceived]);

    const shouldSubscribe = !!onEventReceived || !!onInitialStateReceived;

    useEffect(() => {
        if (!shouldSubscribe || !isConnected || !servers || servers.length === 0) {
            return;
        }

        const activeSubscriptions: StompSubscription[] = [];
        const subscribedDestinations = new Set<string>();

        for (const server of servers) {
            const destination = `/topic/organization/${server.id}`;
            
            if (subscribedDestinations.has(destination)) continue;
            subscribedDestinations.add(destination);
            
            const sub = subscribe(destination, (payload: any) => {
                let event = payload;
                if (typeof event === "string") {
                    try {
                        event = JSON.parse(event.replace(/\0/g, '').trim());
                    } catch (err) {
                        console.error(`Failed to nested-parse event for org ${server.id}`, err);
                    }
                }

                if (onEventReceivedRef.current) {
                    onEventReceivedRef.current(server.id, event);
                }
            });

            if (sub) activeSubscriptions.push(sub);
        }

        const initialSyncSub = subscribe("/user/queue/sync", (payload: any) => {
            let state = payload;
            if (typeof state === "string") {
                try {
                    state = JSON.parse(state.replace(/\0/g, '').trim());
                } catch (err) {
                    console.error("Failed to parse initial state sync string", err);
                }
            }
            if (onInitialStateReceivedRef.current) {
                onInitialStateReceivedRef.current(state);
            }
        });

        if (initialSyncSub) activeSubscriptions.push(initialSyncSub);
        
        return () => {
            activeSubscriptions.forEach(sub => {
                try {
                    sub.unsubscribe();
                } catch (e) {
                    console.warn("STOMP target was already unsubscribed or disconnected", e);
                }
            });
        };
    }, [servers, isConnected, subscribe, shouldSubscribe]);

    const sendOrganizationAction = useCallback((orgId: string, action: string, payload: any) => {
        if (!isConnected) {
            console.warn("Cannot send action, socket is not connected.");
            return;
        }
        const destination = `/app/organization/${orgId}/${action}`;
        send(destination, payload); 
    }, [isConnected, send]);

    const sendToOrganization = useCallback((orgId: string, payload: any) => {
        if (!isConnected) {
            console.warn("Cannot send action, socket is not connected.");
            return;
        }
        const destination = `/app/organization/${orgId}`;
        send(destination, payload); 
    }, [isConnected, send]);

    const requestSync = useCallback((orgId: string) => {
        if (!isConnected) return;
        const destination = `/app/organization/${orgId}/sync`;
        send(destination, {});
    }, [isConnected, send]);

    return {
        sendToOrganization,
        sendOrganizationAction,
        requestSync
    };
};