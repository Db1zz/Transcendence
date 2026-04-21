import "@testing-library/jest-dom";
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import SignupPage from "./SignupPage";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockNavigate = jest.fn();
jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => mockNavigate,
  }),
  { virtual: true },
);

jest.mock("../components/OAuthLogin", () => ({
  OAuthLogin: () => <div data-testid="mock-oauth-login" />,
}));

describe("SignupPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderComponent = () => {
    return render(<SignupPage />);
  };

  it("renders all form inputs and the submit button", () => {
    renderComponent();

    expect(
      screen.getByPlaceholderText(/enter your email/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/this is how others see you/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/pls only use numbers/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/create your password/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  it("debounces the email check and shows available status", async () => {
    const user = userEvent.setup({ delay: null });
    mockedAxios.get.mockResolvedValueOnce({ data: true });

    renderComponent();
    const emailInput = screen.getByPlaceholderText(/enter your email/i);

    await user.type(emailInput, "kaneki@anteiku.com");

    expect(mockedAxios.get).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:8080/api/users/check-email?email=kaneki%40anteiku.com",
      );
      expect(screen.getByText("this email is available")).toBeInTheDocument();
    });
  });

  it("debounces the username check and shows taken status", async () => {
    const user = userEvent.setup({ delay: null });
    mockedAxios.get.mockResolvedValueOnce({ data: false });

    renderComponent();
    const usernameInput = screen.getByPlaceholderText(/pls only use numbers/i);

    await user.type(usernameInput, "touka_k");

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:8080/api/users/check-username?username=touka_k",
      );
      expect(screen.getByText("this username is taken")).toBeInTheDocument();
    });
  });

  it("blocks submission and shows exact errors if password is weak", async () => {
    const user = userEvent.setup({ delay: null });
    renderComponent();

    const passwordInput = screen.getByPlaceholderText(/create your password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    await user.type(passwordInput, "weak");
    await user.click(submitButton);

    expect(mockedAxios.post).not.toHaveBeenCalled();

    const errorText = screen.getByText(
      /password needs: 8\+ characters, 1 uppercase, 1 number, 1 symbol/i,
    );
    expect(errorText).toBeInTheDocument();
  });

  it("submits the form and displays the success screen on valid data", async () => {
    const user = userEvent.setup({ delay: null });
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    renderComponent();

    await user.type(
      screen.getByPlaceholderText(/enter your email/i),
      "hide@ccg.com",
    );
    await user.type(
      screen.getByPlaceholderText(/this is how others see you/i),
      "Hideyoshi",
    );
    await user.type(
      screen.getByPlaceholderText(/pls only use numbers/i),
      "hide_nagachika",
    );

    await user.type(
      screen.getByPlaceholderText(/create your password/i),
      "StrongPassw0rd!",
    );

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8080/api/users/register",
        {
          email: "hide@ccg.com",
          username: "hide_nagachika",
          password: "StrongPassw0rd!",
        },
      );
    });

    const successMessage = await screen.findByText(
      /you have successfully created an account/i,
    );
    expect(successMessage).toBeInTheDocument();

    const backButton = screen.getByRole("button", { name: /back to log in/i });
    await user.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
