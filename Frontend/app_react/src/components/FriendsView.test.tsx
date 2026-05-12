import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { FriendsView } from "./FriendsView";

const mockRefresh = jest.fn();
const mockCallToAUser = jest.fn();

const mockFriendsData = [
  { id: "1", name: "Kaneki", isFriend: "friend", status: "online" },
  { id: "2", name: "Touka", isFriend: "friend", status: "offline" },
  { id: "3", name: "Hide", isFriend: "pending", status: "offline" },
  { id: "4", name: "Tsukiyama", isFriend: "blocked", status: "offline" },
];

jest.mock("../hooks/useFriends", () => ({
  useFriends: () => ({
    friends: mockFriendsData,
    addFriend: jest.fn(),
    acceptFriend: jest.fn(),
    removeFriend: jest.fn(),
    blockUser: jest.fn(),
    unblockUser: jest.fn(),
    refresh: mockRefresh,
  }),
}));

jest.mock("../hooks/useCall", () => ({
  useCall: () => ({ callToAUser: mockCallToAUser }),
}));

jest.mock("./FriendsHeader", () => ({
  FriendsHeader: ({ activeTab, onTabChange, counts }: any) => (
    <div data-testid="mock-friends-header">
      <span data-testid="active-tab">{activeTab}</span>
      <span data-testid="counts">{JSON.stringify(counts)}</span>
      <button onClick={() => onTabChange("all")}>Switch to All</button>
      <button onClick={() => onTabChange("add")}>Switch to Add</button>
    </div>
  ),
}));

jest.mock("./FriendsList", () => ({
  FriendsList: ({ friends, onSearchChange }: any) => (
    <div data-testid="mock-friends-list">
      <span data-testid="friend-count">{friends.length}</span>
      <input
        data-testid="search-input"
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  ),
}));

jest.mock("./AddFriendView", () => ({
  AddFriendView: () => <div data-testid="mock-add-friend-view" />,
}));

describe("FriendsView Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the default 'online' tab and correctly filters online friends", () => {
    render(<FriendsView />);

    expect(screen.getByTestId("active-tab")).toHaveTextContent("online");

    expect(screen.getByTestId("friend-count")).toHaveTextContent("1");
    expect(screen.getByTestId("mock-friends-list")).toBeInTheDocument();
  });

  it("calculates the correct counts for the header", () => {
    render(<FriendsView />);

    const counts = JSON.parse(screen.getByTestId("counts").textContent || "{}");

    expect(counts.online).toBe(1);
    expect(counts.all).toBe(2);
    expect(counts.pending).toBe(1);
    expect(counts.blocked).toBe(1);
  });

  it("changes tabs, calls refresh, and updates filtering when 'all' is selected", async () => {
    const user = userEvent.setup();
    render(<FriendsView />);

    const switchToAllButton = screen.getByRole("button", {
      name: "Switch to All",
    });
    await user.click(switchToAllButton);

    expect(screen.getByTestId("active-tab")).toHaveTextContent("all");

    expect(mockRefresh).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId("friend-count")).toHaveTextContent("2");
  });

  it("renders AddFriendView instead of FriendsList when the 'add' tab is selected", async () => {
    const user = userEvent.setup();
    render(<FriendsView />);

    const switchToAddButton = screen.getByRole("button", {
      name: "Switch to Add",
    });
    await user.click(switchToAddButton);

    expect(screen.queryByTestId("mock-friends-list")).not.toBeInTheDocument();

    expect(screen.getByTestId("mock-add-friend-view")).toBeInTheDocument();
  });

  it("filters friends by search query", async () => {
    const user = userEvent.setup();
    render(<FriendsView />);

    await user.click(screen.getByRole("button", { name: "Switch to All" }));
    expect(screen.getByTestId("friend-count")).toHaveTextContent("2");

    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "Tou");

    expect(screen.getByTestId("friend-count")).toHaveTextContent("1");
  });
});
