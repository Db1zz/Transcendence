import React, { useState } from "react";
import { createContext, useContext, useEffect, type ReactNode } from "react";

export type User = {
  name: string;
  email: string;
  picture?: string;
  status: "online" | "idle" | "dnd" | "offline";
  //i will add it to db maybe we can migrate to redis later idk
  about: string;
  createdAt: string;
  role: "USER" | "ADMIN";
};

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: false,
  user: null,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  //const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8080/api/user", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("not authenticated");
        return res.json();
      })
      .then((data) => {
        console.log("data= ", data);
        if (!data) setUser(null);
        else {
          setUser({
            name: data.name,
            email: data.email,
            picture: data.picture,
            status: "online",
            //placeholder
            about: "default text",
            //again placeholder
            role: data.role,
            createdAt: data.createdAt,
          });
        }
      })
      .catch((e) => {
        console.log("error = ", e);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const isAuthenticated = !!user;
  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
