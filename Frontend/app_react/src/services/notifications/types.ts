export enum EventType {
    MESSAGE_CREATED,
}

export enum EventScope {
    DM = "DM",
    GROUP_CHAT = "GROUP_CHAT",
    SERVER = "SERVER"
}

export interface NotificationEvent {
    id: string,
    type: EventType;
    scope: EventScope;
    payload: any;
}

export interface DmPayload {
    userId: string;
    senderId: string;
    chatId: string;
    content: string;
    timestamp: number;
}

export interface ServerChatPayload extends DmPayload {
    serverId: string;
}