import { renderHook, waitFor, act } from "@testing-library/react";
import { useChatChannels } from "./useChatChannels";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

jest.mock("../utils/api");
const mockedApi = api as jest.Mocked<typeof api>;

jest.mock("../contexts/AuthContext");
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("useChatChannels Hook", () => {
  const mockChatChannels = [
    {
      channelId: "channel-1", 
      otherUserId: "user-2",
      otherUserName: "Touka",
      otherUserPicture: "touka.png",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not fetch and returns loading as false if user is not authenticated", async () => {
    mockedUseAuth.mockReturnValue({ user: null } as any);

    const { result } = renderHook(() => useChatChannels());

    expect(result.current.loading).toBe(false);
    expect(result.current.chatChannels).toEqual([]);
    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  it("fetches chat channels successfully on mount for an authenticated user", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } } as any);

    mockedApi.get.mockResolvedValueOnce({ data: mockChatChannels });

    const { result } = renderHook(() => useChatChannels());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApi.get).toHaveBeenCalledWith("/chat/channels");
    expect(result.current.chatChannels).toEqual(mockChatChannels);
    expect(result.current.error).toBeNull();
  });

  it("handles API errors gracefully and sets the error state", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } } as any);

    mockedApi.get.mockRejectedValueOnce(
      new Error("Failed to fetch chat channels"),
    );

    const { result } = renderHook(() => useChatChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch chat channels");
    expect(result.current.chatChannels).toEqual([]);
  });

  it("allows manual refetching using the refetch function", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } } as any);

    mockedApi.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockChatChannels });

    const { result } = renderHook(() => useChatChannels());

    await waitFor(() => {
      expect(result.current.chatChannels).toEqual([]);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedApi.get).toHaveBeenCalledTimes(2);
    expect(result.current.chatChannels).toEqual(mockChatChannels);
  });
});