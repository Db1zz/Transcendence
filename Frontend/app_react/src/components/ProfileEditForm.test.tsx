import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileEditForm, ProfileEditValues } from "./ProfileEditForm";

jest.mock("lucide-react", () => ({
  Pencil: () => <span>PencilIcon</span>,
}));

describe("ProfileEditForm Component", () => {
  const mockOnSave = jest.fn();
  const mockOnUploadPicture = jest.fn();

  const initialValues: ProfileEditValues = {
    username: "kaneki_ken",
    displayName: "Kaneki",
    about: "I like coffee and books.",
    picture: "http://example.com/avatar.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with initial values populated in the fields", () => {
    render(
      <ProfileEditForm
        initialValues={initialValues}
        isSaving={false}
        onUploadPicture={mockOnUploadPicture}
        onSave={mockOnSave}
      />,
    );

    expect(screen.getByDisplayValue("kaneki_ken")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Kaneki")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("I like coffee and books."),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Profile")).toHaveAttribute(
      "src",
      "http://example.com/avatar.jpg",
    );
  });

  it("updates text values and calls onSave with the new values on submit", async () => {
    const user = userEvent.setup();
    render(
      <ProfileEditForm
        initialValues={initialValues}
        isSaving={false}
        onUploadPicture={mockOnUploadPicture}
        onSave={mockOnSave}
      />,
    );

    const usernameInput = screen.getByPlaceholderText("your username");
    const displayNameInput = screen.getByPlaceholderText(
      "name shown in profile",
    );
    const aboutInput = screen.getByPlaceholderText(
      "tell people something about yourself",
    );
    const submitButton = screen.getByRole("button", { name: /save/i });

    await user.clear(usernameInput);
    await user.type(usernameInput, "haise_sasaki");

    await user.clear(displayNameInput);
    await user.type(displayNameInput, "Haise");

    await user.clear(aboutInput);
    await user.type(aboutInput, "CCG Investigator.");

    await user.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith({
      username: "haise_sasaki",
      displayName: "Haise",
      about: "CCG Investigator.",
      picture: "http://example.com/avatar.jpg",
    });
  });

  it("handles successful picture upload and updates the image preview", async () => {
    const user = userEvent.setup();
    const newPictureUrl = "http://example.com/new-avatar.jpg";

    mockOnUploadPicture.mockResolvedValueOnce(newPictureUrl);

    render(
      <ProfileEditForm
        initialValues={initialValues}
        isSaving={false}
        onUploadPicture={mockOnUploadPicture}
        onSave={mockOnSave}
      />,
    );

    const file = new File(["(⌐□_□)"], "cool-glasses.png", {
      type: "image/png",
    });

    const fileInput = screen.getByLabelText(/upload from computer/i);

    await user.upload(fileInput, file);

    expect(mockOnUploadPicture).toHaveBeenCalledWith(file);
    expect(mockOnUploadPicture).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByAltText("Profile")).toHaveAttribute(
        "src",
        newPictureUrl,
      );
    });
  });

  it("shows an error message when picture upload fails", async () => {
    const user = userEvent.setup();

    const apiError = {
      response: {
        data: { error: "File too large" },
      },
    };
    mockOnUploadPicture.mockRejectedValueOnce(apiError);

    render(
      <ProfileEditForm
        initialValues={initialValues}
        isSaving={false}
        onUploadPicture={mockOnUploadPicture}
        onSave={mockOnSave}
      />,
    );

    const file = new File(["huge data"], "huge.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/upload from computer/i);

    await user.upload(fileInput, file);

    const errorMessage = await screen.findByText("File too large");
    expect(errorMessage).toBeInTheDocument();
  });

  it("disables the submit button and changes text when isSaving is true", () => {
    render(
      <ProfileEditForm
        initialValues={initialValues}
        isSaving={true}
        onUploadPicture={mockOnUploadPicture}
        onSave={mockOnSave}
      />,
    );

    const submitButton = screen.getByRole("button", { name: /saving\.\.\./i });
    expect(submitButton).toBeDisabled();
  });

  it("displays the generic errorMessage passed via props", () => {
    render(
      <ProfileEditForm
        initialValues={initialValues}
        isSaving={false}
        errorMessage="Username already taken"
        onUploadPicture={mockOnUploadPicture}
        onSave={mockOnSave}
      />,
    );

    expect(screen.getByText("Username already taken")).toBeInTheDocument();
  });
});
