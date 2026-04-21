import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { FriendsList } from "./FriendsList";
import { Friend } from "./FriendsView";

jest.mock("./ProfileButton", () => ({
  ProfileButton: ({ user, children }: any) => (
    <div data-testid={`mock-profile-${user.id}`}>
      <span>{user.name}</span>
      <div>{children}</div>
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  Search: () => <span>SearchIcon</span>,
  Users: () => <span>UsersIcon</span>,
  MessageCircle: () => <span>MessageIcon</span>,
  Ban: () => <span>BanIcon</span>,
  Check: () => <span>CheckIcon</span>,
  X: () => <span>XIcon</span>,
  Phone: () => <span>PhoneIcon</span>,
}));

describe("FriendsList Component", () => {
  const mockOnSearchChange = jest.fn();
  const mockOnMessage = jest.fn();
  const mockOnAccept = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnBlock = jest.fn();
  const mockOnUnblock = jest.fn();
  const mockOnCall = jest.fn();

  const defaultProps = {
    searchQuery: "",
    onSearchChange: mockOnSearchChange,
    onMessage: mockOnMessage,
    onAccept: mockOnAccept,
    onRemove: mockOnRemove,
    onBlock: mockOnBlock,
    onUnblock: mockOnUnblock,
    onCall: mockOnCall,
  };

  const mockFriend: Friend = {
    id: "1",
    name: "Touka",
    username: "touka_k",
    status: "online",
    about: "Coffee manager",
    createdAt: "2024-01-01",
    isFriend: "friend",
    role: "USER",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when there are no friends", () => {
    render(<FriendsList {...defaultProps} friends={[]} activeTab="all" />);

    expect(screen.getByText(/noone here/i)).toBeInTheDocument();
    expect(screen.getByText("All friends - 0")).toBeInTheDocument();
  });

  it("calls onSearchChange when typing in the search box", async () => {
    const user = userEvent.setup();
    render(<FriendsList {...defaultProps} friends={[]} activeTab="all" />);

    const searchInput = screen.getByPlaceholderText("search friends.");
    await user.type(searchInput, "T");

    expect(mockOnSearchChange).toHaveBeenCalledWith("T");
  });

  it("renders default action buttons for 'online' or 'all' tabs and fires callbacks", async () => {
    const user = userEvent.setup();
    render(
      <FriendsList
        {...defaultProps}
        friends={[mockFriend]}
        activeTab="online"
      />,
    );

    expect(screen.getByText("Touka")).toBeInTheDocument();

    const callButton = screen.getByRole("button", { name: /PhoneIcon/i });
    const msgButton = screen.getByRole("button", { name: /MessageIcon/i });
    const blockButton = screen.getByRole("button", { name: /BanIcon/i });

    await user.click(callButton);
    await user.click(msgButton);
    await user.click(blockButton);

    expect(mockOnCall).toHaveBeenCalledWith("1");
    expect(mockOnMessage).toHaveBeenCalledWith(mockFriend);
    expect(mockOnBlock).toHaveBeenCalledWith("1");
  });

  it("renders Accept and Remove buttons for 'pending' tab if canAcceptPending is true", async () => {
    const user = userEvent.setup();
    const pendingFriend = {
      ...mockFriend,
      isFriend: "pending" as const,
      canAcceptPending: true,
    };

    render(
      <FriendsList
        {...defaultProps}
        friends={[pendingFriend]}
        activeTab="pending"
      />,
    );

    const acceptButton = screen.getByRole("button", { name: /CheckIcon/i });
    const removeButton = screen.getByRole("button", { name: /XIcon/i });

    await user.click(acceptButton);
    await user.click(removeButton);

    expect(mockOnAccept).toHaveBeenCalledWith("1");
    expect(mockOnRemove).toHaveBeenCalledWith("1");
  });

  it("hides the Accept button if canAcceptPending is false", () => {
    const pendingFriend = {
      ...mockFriend,
      isFriend: "pending" as const,
      canAcceptPending: false,
    };

    render(
      <FriendsList
        {...defaultProps}
        friends={[pendingFriend]}
        activeTab="pending"
      />,
    );

    expect(
      screen.queryByRole("button", { name: /CheckIcon/i }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole("button", { name: /XIcon/i })).toBeInTheDocument();
  });

  it("renders Unblock button for 'blocked' tab and fires callback", async () => {
    const user = userEvent.setup();
    const blockedFriend = { ...mockFriend, isFriend: "blocked" as const };

    render(
      <FriendsList
        {...defaultProps}
        friends={[blockedFriend]}
        activeTab="blocked"
      />,
    );

    const unblockButton = screen.getByRole("button", { name: /BanIcon/i });
    await user.click(unblockButton);

    expect(mockOnUnblock).toHaveBeenCalledWith("1");
  });
});
