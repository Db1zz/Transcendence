import React, { useState, useCallback } from "react";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import defaultAvatar from "../img/default.png";
import api from "../utils/api";
import axios from "axios";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  picture?: string;
  status: "online" | "idle" | "dnd" | "offline";
  about: string;
  createdAt: string;
  role: "USER" | "ADMIN";
};

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  login: (
    provider: "github" | "google" | "credentials",
    credentials?: { email: string; password: string },
  ) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: false,
  user: null,
  setUser: () => {},
  login: async () => false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const saveAuthData = (data: any) => {
    const userPayload = data.userInfo || data;

    const userData: User = {
      id: userPayload.id || "",
      name:
        userPayload.displayName ||
        userPayload.name ||
        userPayload.username ||
        "",
      username: userPayload.username || "",
      email: userPayload.email || "",
      picture: userPayload.picture || defaultAvatar,
      role: userPayload.role || "USER",
      status: "online",
      about: userPayload.about || "",
      createdAt: userPayload.createdAt || "",
    };

    console.log("SAVING USER");
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await api.get("/users/me");
      saveAuthData(response.data);
    } catch (error) {
      setUser(null);
      localStorage.removeItem("user");
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        //refresh user
        // if (!parsedUser?.createdAt) {
        //   checkAuthStatus();
        // }
      } catch (error) {
        localStorage.removeItem("user");
        setUser(null);
        checkAuthStatus();
      }
    } else {
      checkAuthStatus();
    }
    setLoading(false);
  }, [checkAuthStatus]);

  const login = async (
    provider: "github" | "google" | "credentials",
    credentials?: { email: string; password: string },
  ): Promise<boolean> => {
    if (provider === "github" || provider === "google") {
      window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
      return true;
    }

    if (provider === "credentials" && credentials) {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/auth/login",
          {
            email: credentials.email,
            password: credentials.password,
          },
          { withCredentials: true },
        );
        saveAuthData(response.data);
        return true;
      } catch (error) {
        console.error("error during login:", error);
        return false;
      }
    }

    return false;
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/logout",
        {},
        { withCredentials: true },
      );
    } catch (error) {
      console.error("error during logout:", error);
    } finally {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const isAuthenticated = !!user;
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, user, setUser, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
