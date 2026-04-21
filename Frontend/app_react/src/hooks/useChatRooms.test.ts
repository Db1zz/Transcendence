import { renderHook, waitFor, act } from "@testing-library/react";
import { useChatRooms } from "./useChatRooms";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

jest.mock("../utils/api");
const mockedApi = api as jest.Mocked<typeof api>;

jest.mock("../contexts/AuthContext");
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("useChatRooms Hook", () => {
  const mockChatRooms = [
    {
      roomId: "room-1",
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

    const { result } = renderHook(() => useChatRooms());

    expect(result.current.loading).toBe(false);
    expect(result.current.chatRooms).toEqual([]);
    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  it("fetches chat rooms successfully on mount for an authenticated user", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } } as any);

    mockedApi.get.mockResolvedValueOnce({ data: mockChatRooms });

    const { result } = renderHook(() => useChatRooms());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApi.get).toHaveBeenCalledWith("/chat/rooms");
    expect(result.current.chatRooms).toEqual(mockChatRooms);
    expect(result.current.error).toBeNull();
  });

  it("handles API errors gracefully and sets the error state", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } } as any);

    mockedApi.get.mockRejectedValueOnce(
      new Error("Failed to fetch chat rooms"),
    );

    const { result } = renderHook(() => useChatRooms());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch chat rooms");
    expect(result.current.chatRooms).toEqual([]);
  });

  it("allows manual refetching using the refetch function", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } } as any);

    mockedApi.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockChatRooms });

    const { result } = renderHook(() => useChatRooms());

    await waitFor(() => {
      expect(result.current.chatRooms).toEqual([]);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedApi.get).toHaveBeenCalledTimes(2);
    expect(result.current.chatRooms).toEqual(mockChatRooms);
  });
});
