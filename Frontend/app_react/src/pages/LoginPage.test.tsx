import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./LoginPage";

const mockNavigate = jest.fn();
let mockLocation: any = { state: null };

jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  }),
  { virtual: true },
);

const mockLogin = jest.fn();
let mockIsAuthenticated = false;

jest.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    login: mockLogin,
  }),
}));

jest.mock("../components/OAuthLogin", () => ({
  OAuthLogin: () => <div data-testid="mock-oauth-login" />,
}));

describe("LoginPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated = false;
    mockLocation = { state: null };
  });

  it("renders the login form correctly", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "login" })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your email/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByTestId("mock-oauth-login")).toBeInTheDocument();
  });

  it("redirects immediately to the default location if the user is already authenticated", () => {
    mockIsAuthenticated = true;

    render(<LoginPage />);

    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("redirects to a specific intended location if provided in state", () => {
    mockIsAuthenticated = true;
    mockLocation = { state: { from: { pathname: "/info" } } };

    render(<LoginPage />);

    expect(mockNavigate).toHaveBeenCalledWith("/info", { replace: true });
  });

  it("shows an error message if the login fails", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(false);

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "touka@anteiku.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith("credentials", {
      email: "touka@anteiku.com",
      password: "wrongpassword",
    });

    const errorMessage = await screen.findByText(
      /incorrect credentials, try again/i,
    );
    expect(errorMessage).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("navigates to /home when the login succeeds", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(true);

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "kaneki@anteiku.com");
    await user.type(passwordInput, "coffee123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });

    expect(
      screen.queryByText(/incorrect credentials, try again/i),
    ).not.toBeInTheDocument();
  });
});
