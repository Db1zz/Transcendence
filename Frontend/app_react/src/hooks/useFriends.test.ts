import { renderHook, waitFor, act } from "@testing-library/react";
import { useFriends } from "./useFriends";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

jest.mock("../utils/api");
const mockedApi = api as jest.Mocked<typeof api>;

jest.mock("../contexts/AuthContext");
const mockedUseAuth = useAuth as jest.Mock;

describe("useFriends Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    mockedApi.get.mockImplementation((url: string, config?: any) => {
      if (url === "/friends") {
        return Promise.resolve({
          data: [
            {
              id: "1",
              displayName: "Kaneki",
              username: "kaneki_k",
              picture: "k.png",
            },
          ],
        });
      }
      if (url === "/friends/requests") {
        return Promise.resolve({
          data: [
            {
              id: "2",
              displayName: "Touka",
              username: "touka_t",
              picture: "t.png",
            },
          ],
        });
      }
      if (url === "/friends/requests/sent") {
        return Promise.resolve({
          data: [
            {
              id: "3",
              displayName: "Hide",
              username: "hideyoshi",
              picture: "h.png",
            },
          ],
        });
      }
      if (url === "/friends/blocked") {
        return Promise.resolve({
          data: [
            {
              id: "4",
              displayName: "Tsukiyama",
              username: "tsuki",
              picture: "ts.png",
            },
          ],
        });
      }
      if (url.startsWith("/users/public/")) {
        return Promise.resolve({ data: [{ id: "5", username: "new_friend" }] });
      }
      return Promise.reject(new Error("Not found"));
    });

    mockedApi.post.mockResolvedValue({ data: {} });
    mockedApi.put.mockResolvedValue({ data: {} });
    mockedApi.delete.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns an empty array and loading as false if user is not authenticated", async () => {
    mockedUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useFriends());

    expect(result.current.loading).toBe(false);
    expect(result.current.friends).toEqual([]);
    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  it("fetches all friend types concurrently and merges them correctly", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } });

    const { result } = renderHook(() => useFriends());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApi.get).toHaveBeenCalledWith("/friends");
    expect(mockedApi.get).toHaveBeenCalledWith("/friends/requests");
    expect(mockedApi.get).toHaveBeenCalledWith("/friends/requests/sent");
    expect(mockedApi.get).toHaveBeenCalledWith("/friends/blocked");

    const { friends } = result.current;
    expect(friends).toHaveLength(4);

    expect(friends[0]).toMatchObject({
      id: "1",
      name: "Kaneki",
      isFriend: "friend",
    });
    expect(friends[1]).toMatchObject({
      id: "2",
      name: "Touka",
      isFriend: "pending",
      canAcceptPending: true,
    });
    expect(friends[2]).toMatchObject({
      id: "3",
      name: "Hide",
      isFriend: "pending",
      canAcceptPending: false,
    });
    expect(friends[3]).toMatchObject({
      id: "4",
      name: "Tsukiyama",
      isFriend: "blocked",
    });
  });

  it("handles fetch errors gracefully and leaves the array empty", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } });

    mockedApi.get.mockRejectedValue(new Error("API Down"));

    const { result } = renderHook(() => useFriends());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.friends).toEqual([]);
    expect(console.log).toHaveBeenCalledWith(
      "Failed to fetch friends",
      expect.any(Error),
    );
  });

  it("adds a friend by searching the username and then posting to their ID", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } });
    const { result } = renderHook(() => useFriends());

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockedApi.get.mockClear();

    await act(async () => {
      await result.current.addFriend("new_friend");
    });

    expect(mockedApi.get).toHaveBeenCalledWith("/users/public/new_friend");

    expect(mockedApi.post).toHaveBeenCalledWith("/friends/5");

    expect(mockedApi.get).toHaveBeenCalledWith("/friends");
  });

  it("throws an error if adding a friend fails", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } });
    const { result } = renderHook(() => useFriends());

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockedApi.get.mockRejectedValueOnce(new Error("User not found"));

    await expect(
      act(async () => {
        await result.current.addFriend("ghost_user");
      }),
    ).rejects.toThrow("Failed to send request");
  });

  it("accepts a friend request and refreshes", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } });
    const { result } = renderHook(() => useFriends());

    await waitFor(() => expect(result.current.loading).toBe(false));
    mockedApi.get.mockClear();

    await act(async () => {
      await result.current.acceptFriend("2");
    });

    expect(mockedApi.put).toHaveBeenCalledWith("/friends/2");
    expect(mockedApi.get).toHaveBeenCalledWith("/friends");
  });

  it("removes a friend and refreshes", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } });
    const { result } = renderHook(() => useFriends());

    await waitFor(() => expect(result.current.loading).toBe(false));
    mockedApi.get.mockClear();

    await act(async () => {
      await result.current.removeFriend("1");
    });

    expect(mockedApi.delete).toHaveBeenCalledWith("/friends/1");
    expect(mockedApi.get).toHaveBeenCalledWith("/friends");
  });

  it("blocks a user and refreshes", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } });
    const { result } = renderHook(() => useFriends());

    await waitFor(() => expect(result.current.loading).toBe(false));
    mockedApi.get.mockClear();

    await act(async () => {
      await result.current.blockUser("3");
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/friends/3/block");
    expect(mockedApi.get).toHaveBeenCalledWith("/friends");
  });

  it("unblocks a user and refreshes", async () => {
    mockedUseAuth.mockReturnValue({ user: { id: "user-1" } });
    const { result } = renderHook(() => useFriends());

    await waitFor(() => expect(result.current.loading).toBe(false));
    mockedApi.get.mockClear();

    await act(async () => {
      await result.current.unblockUser("4");
    });

    expect(mockedApi.delete).toHaveBeenCalledWith("/friends/4/block");
    expect(mockedApi.get).toHaveBeenCalledWith("/friends");
  });
});
