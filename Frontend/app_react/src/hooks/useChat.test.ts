import { renderHook, waitFor, act } from "@testing-library/react";
import { useChat } from "./useChat";
import api from "../utils/api";
import { Client } from "@stomp/stompjs";

jest.mock("../utils/api");
const mockedApi = api as jest.Mocked<typeof api>;

let mockClientInstance: any = null;

jest.mock("@stomp/stompjs", () => {
  return {
    Client: class MockClient {
      activate = jest.fn();
      deactivate = jest.fn();
      subscribe = jest.fn();
      publish = jest.fn();
      connected = false;
      _config: any;

      constructor(config: any) {
        this._config = config;
        mockClientInstance = this;
      }
    },
  };
});

describe("useChat Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClientInstance = null;
  });

  it("fetches chat history on mount and updates messages state", async () => {
    const mockHistory = [
      {
        id: "1",
        roomId: "room-1",
        senderId: "user-A",
        content: "Hello",
        createdAt: "2024-01-01",
      },
    ];

    let resolveApi!: (value: any) => void;
    mockedApi.get.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveApi = resolve;
        }),
    );

    const { result } = renderHook(() => useChat("room-1"));

    expect(result.current.messages).toEqual([]);

    await act(async () => {
      resolveApi({ data: mockHistory });
    });

    expect(mockedApi.get).toHaveBeenCalledWith("/chat/rooms/room-1/messages");
    expect(result.current.messages).toEqual(mockHistory);
  });

  it("handles history load failure gracefully", async () => {
    let rejectApi!: (reason: any) => void;
    mockedApi.get.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectApi = reject;
        }),
    );

    const { result } = renderHook(() => useChat("room-1"));

    await act(async () => {
      rejectApi(new Error("Network Error"));
    });

    expect(mockedApi.get).toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
  });

  const freezeApi = () => {
    mockedApi.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves!
  };

  it("connects to STOMP and subscribes to the room topic", async () => {
    freezeApi();
    const { result } = renderHook(() => useChat("room-1"));

    expect(mockClientInstance).toBeTruthy();
    expect(mockClientInstance.activate).toHaveBeenCalled();
    expect(result.current.connected).toBe(false);

    act(() => {
      mockClientInstance.connected = true;
      mockClientInstance._config.onConnect();
    });

    expect(result.current.connected).toBe(true);
    expect(mockClientInstance.subscribe).toHaveBeenCalledWith(
      "/topic/chat/room-1",
      expect.any(Function),
    );
  });

  it("appends new incoming WebSocket messages to the message list", async () => {
    freezeApi();
    const { result } = renderHook(() => useChat("room-1"));

    act(() => {
      mockClientInstance._config.onConnect();
    });

    const messageCallback = mockClientInstance.subscribe.mock.calls[0][1];
    const newWsMessage = {
      id: "2",
      roomId: "room-1",
      senderId: "user-B",
      content: "Second",
      createdAt: "2024-01-02",
    };

    act(() => {
      messageCallback({ body: JSON.stringify(newWsMessage) });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual(newWsMessage);
  });

  it("allows sending a message if connected", async () => {
    freezeApi();
    const { result } = renderHook(() => useChat("room-1"));

    act(() => {
      mockClientInstance.connected = true;
      mockClientInstance._config.onConnect();
    });

    act(() => {
      result.current.sendMessage("Hello World", "user-1");
    });

    expect(mockClientInstance.publish).toHaveBeenCalledWith({
      destination: "/app/chat.send",
      body: JSON.stringify({
        roomId: "room-1",
        senderId: "user-1",
        content: "Hello World",
      }),
    });
  });

  it("prevents sending empty messages or sending while disconnected", async () => {
    freezeApi();
    const { result } = renderHook(() => useChat("room-1"));

    act(() => {
      result.current.sendMessage("Hello", "user-1");
    });
    expect(mockClientInstance.publish).not.toHaveBeenCalled();

    act(() => {
      mockClientInstance.connected = true;
      mockClientInstance._config.onConnect();
    });

    act(() => {
      result.current.sendMessage("   ", "user-1");
    });

    expect(mockClientInstance.publish).not.toHaveBeenCalled();
  });

  it("deactivates the STOMP client when the hook unmounts", () => {
    freezeApi();
    const { unmount } = renderHook(() => useChat("room-1"));

    unmount();

    expect(mockClientInstance.deactivate).toHaveBeenCalled();
  });
});
