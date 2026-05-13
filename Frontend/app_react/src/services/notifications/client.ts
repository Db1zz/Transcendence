import api from "../../utils/api";

export class NotifyClient {
  public notifyServerAddr: string;
  private ws: WebSocket | null;

  public onMessageReceived?: (data: any) => void;

  constructor(notifyServerAddr: string) {
    this.notifyServerAddr = notifyServerAddr;
    this.ws = null;
  }

  public async fetchOfflineNotifications(token: string): Promise<any[]> {
    try {
      const response = await fetch(`http://127.0.0.1:9921/notification`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");
      return await response.json();
    } catch (err) {
      console.error("Rust Backend Error:", err);
      return [];
    }
  }

  public async markNotificationsAsRead(token: string, notificationIds: string[]): Promise<boolean> {
      if (notificationIds.length === 0) return true;

      try {
          const response = await fetch(`http://127.0.0.1:9921/notification/read`, {
              method: "POST",
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ notification_ids: notificationIds })            
          });
          return response.ok;
      } catch (err) {
          console.error("Failed to mark notifications as read:", err);
          return false;
      }
  }

  public async start(): Promise<string | null> {
    if (this.ws !== null) {
      return null;
    }

    try {
      const res = await api.get<{ token: string }>("/notification/token");
      const token = res.data.token;

      this.ws = new WebSocket(this.notifyServerAddr);

      this.ws.onopen = () => {
        this.ws?.send(token);
        console.log("Notify client: Auth message sent to server");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessageReceived?.(data);
        } catch (parseErr) {
          console.error("Failed to parse WS message:", parseErr);
        }
      };

      this.ws.onclose = (event) => {
        this.ws = null;
        console.log(`Notify client connection closed. Code: ${event.code}`);
      };

      this.ws.onerror = (err) => {
        console.error("Notify client WebSocket error:", err);
      };

      return token;
    } catch (err) {
      console.error("Notify client failed to start:", err);
      this.ws = null;
      return null;
    }
  }

  public send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("Cannot send message: WebSocket is not open");
    }
  }

  public stop(): void {
    if (this.ws === null) {
      return;
    }

    this.ws.close();
    this.ws = null;
    console.log("Notify client stopped manually");
  }
}