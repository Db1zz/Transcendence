import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddFriendView } from "./AddFriendView";

describe("AddFriendView Component", () => {
  const mockOnAddFriend = jest.fn();

  beforeEach(() => {
    mockOnAddFriend.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the input and button correctly", () => {
    render(<AddFriendView onAddFriend={mockOnAddFriend} />);

    expect(screen.getByPlaceholderText(/enter a name/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send request/i }),
    ).toBeInTheDocument();
  });

  it("does not call onAddFriend if the input is empty", async () => {
    const user = userEvent.setup({ delay: null });
    render(<AddFriendView onAddFriend={mockOnAddFriend} />);

    const button = screen.getByRole("button", { name: /send request/i });

    await user.click(button);

    expect(mockOnAddFriend).not.toHaveBeenCalled();
  });

  it("shows an error message if the API call fails", async () => {
    const user = userEvent.setup({ delay: null });
    mockOnAddFriend.mockRejectedValueOnce(new Error("API Error"));

    render(<AddFriendView onAddFriend={mockOnAddFriend} />);

    const input = screen.getByPlaceholderText(/enter a name/i);
    const button = screen.getByRole("button", { name: /send request/i });

    await user.type(input, "kaneki");
    await user.click(button);

    expect(mockOnAddFriend).toHaveBeenCalledWith("kaneki");

    const errorMessage = await screen.findByText(
      /There are no users with such name/i,
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it("shows a success message, then clears it and the input after 3 seconds", async () => {
    const user = userEvent.setup({ delay: null });
    mockOnAddFriend.mockResolvedValueOnce(undefined);

    render(<AddFriendView onAddFriend={mockOnAddFriend} />);

    const input = screen.getByPlaceholderText(/enter a name/i);
    const button = screen.getByRole("button", { name: /send request/i });

    await user.type(input, "touka");
    await user.click(button);

    const successMessage = await screen.findByText(
      /Friend request successfuly sent/i,
    );
    expect(successMessage).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(
      screen.queryByText(/Friend request successfuly sent/i),
    ).not.toBeInTheDocument();

    expect(input).toHaveValue("");
  });
});
