import { Client, StompSubscription, IFrame, IMessage } from "@stomp/stompjs";

class SocketService {
  private client: Client | null = null;
  private isConnected: boolean = false;

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client && this.isConnected) {
        resolve();
        return;
      }

      this.client = new Client({
        brokerURL: "https://localhost/ws",
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        reconnectDelay: 2000,

        debug: (str: string) => {
          console.log(new Date().toISOString() + " [STOMP]: " + str);
        },
      });

      this.client.onConnect = (frame: IFrame) => {
        this.isConnected = true;
        resolve();
      };

      this.client.onStompError = (frame: IFrame) => {
        console.error("STOMP Error:", frame.headers["message"]);
        reject(frame);
      };

      this.client.onWebSocketClose = () => {
        this.isConnected = false;
      };

      this.client.activate();
    });
  }

  public subscribe(
    destination: string,
    callback: (payload: any) => void,
  ): StompSubscription {
    if (!this.client || !this.isConnected) {
      throw new Error(
        "Cannot subscribe! Frontend does not connected to the socket",
      );
    }

    return this.client.subscribe(destination, (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (e) {
        callback(message.body);
      }
    });
  }

  public send(destination: string, body: any): void {
    if (!this.client || !this.isConnected) {
      return;
    }

    this.client.publish({
      destination: destination,
      body: JSON.stringify(body),
    });
  }

  public disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
    }
  }
}

export const socketService = new SocketService();
