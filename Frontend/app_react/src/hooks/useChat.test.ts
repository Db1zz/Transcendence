import { renderHook, act } from "@testing-library/react";
import { useChat } from "./useChat";
import api from "../utils/api";
import { useSocket } from "../contexts/SocketContext";

jest.mock("../utils/api");
const mockedApi = api as jest.Mocked<typeof api>;

jest.mock("../contexts/SocketContext");
const mockedUseSocket = useSocket as jest.Mock;

describe("useChat Hook", () => {
  const mockSubscribe = jest.fn();
  const mockSend = jest.fn();
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});

    mockSubscribe.mockReturnValue({ unsubscribe: mockUnsubscribe });
    mockedUseSocket.mockReturnValue({
      isConnected: false,
      subscribe: mockSubscribe,
      send: mockSend,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const freezeApi = () => {
    mockedApi.get.mockImplementationOnce(() => new Promise(() => {}));
  };

  it("fetches chat history on mount and updates messages state", async () => {
    const mockHistory = [
      {
        id: "1",
        channelId: "channel-1",
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

    const { result } = renderHook(() => useChat("channel-1"));

    expect(result.current.messages).toEqual([]);

    await act(async () => {
      resolveApi({ data: [...mockHistory] });
    });

    expect(mockedApi.get).toHaveBeenCalledWith(
      "/chat/channels/channel-1/messages?page=0&size=50",
    );
    expect(result.current.messages).toEqual(mockHistory.reverse());
  });

  it("handles history load failure gracefully", async () => {
    let rejectApi!: (reason: any) => void;
    mockedApi.get.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectApi = reject;
        }),
    );

    const { result } = renderHook(() => useChat("channel-1"));

    await act(async () => {
      rejectApi(new Error("Network Error"));
    });

    expect(mockedApi.get).toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
  });

  it("subscribes to the channel topic when connected", () => {
    freezeApi();
    
    mockedUseSocket.mockReturnValue({
      isConnected: true,
      subscribe: mockSubscribe,
      send: mockSend,
    });

    const { result } = renderHook(() => useChat("channel-1"));

    expect(result.current.connected).toBe(true);
    expect(mockSubscribe).toHaveBeenCalledWith(
      "/topic/chat/channel-1",
      expect.any(Function),
    );
  });

  it("appends new incoming WebSocket messages to the message list", () => {
    freezeApi();
    
    mockedUseSocket.mockReturnValue({
      isConnected: true,
      subscribe: mockSubscribe,
      send: mockSend,
    });

    const { result } = renderHook(() => useChat("channel-1"));

    const messageCallback = mockSubscribe.mock.calls[0][1];
    
    const newWsMessage = {
      id: "2",
      channelId: "channel-1",
      senderId: "user-B",
      content: "Second",
      createdAt: "2024-01-02",
    };

    act(() => {
      messageCallback(newWsMessage);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual(newWsMessage);
  });

  it("allows sending a message if connected", () => {
    freezeApi();
    
    mockedUseSocket.mockReturnValue({
      isConnected: true,
      subscribe: mockSubscribe,
      send: mockSend,
    });

    const { result } = renderHook(() => useChat("channel-1"));

    act(() => {
      result.current.sendMessage("Hello World", "user-1");
    });

    expect(mockSend).toHaveBeenCalledWith("/app/chat.send", {
      channelId: "channel-1",
      senderId: "user-1",
      content: "Hello World",
    });
  });

  it("prevents sending empty messages or sending while disconnected", () => {
    freezeApi();
    
    const { result: disconnectedResult, unmount } = renderHook(() => useChat("channel-1"));

    act(() => {
      disconnectedResult.current.sendMessage("Hello", "user-1");
    });
    expect(mockSend).not.toHaveBeenCalled();
    unmount();

    mockedUseSocket.mockReturnValue({
      isConnected: true,
      subscribe: mockSubscribe,
      send: mockSend,
    });
    
    const { result: connectedResult } = renderHook(() => useChat("channel-1"));

    act(() => {
      connectedResult.current.sendMessage("   ", "user-1");
    });

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("unsubscribes from the topic when the hook unmounts", () => {
    freezeApi();
    
    mockedUseSocket.mockReturnValue({
      isConnected: true,
      subscribe: mockSubscribe.mockReturnValue({ unsubscribe: mockUnsubscribe }),
      send: mockSend,
    });

    const { unmount } = renderHook(() => useChat("channel-1"));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});