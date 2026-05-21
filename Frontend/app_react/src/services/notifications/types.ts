export enum EventType {
  MESSAGE_CREATED,
  JOIN_CALL_CREATED,
}

export enum EventScope {
  DM = "DM",
  GROUP_CHANNEL = "GROUP_CHANNEL",
  SERVER_CHANNEL = "SERVER_CHANNEL",
}

export interface NotificationEvent {
  id: string;
  type: EventType;
  scope: EventScope;
  payload: any;
}

export interface BackendNotification {
  id: string;
  etype: string;
  scope: string;
  payload: string | Record<string, unknown>;
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
