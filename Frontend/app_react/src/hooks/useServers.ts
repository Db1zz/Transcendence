import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

export interface Organization {
  id: string;
  name: string;
  iconUrl?: string;
  ownerId?: string;
}

export const useServers = () => {
  const [servers, setServers] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/organizations");
      setServers(response.data);
    } catch (error) {
      console.error("Failed to fetch servers", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const createServer = async (name: string) => {
    try {
      const response = await api.post("/organizations", { name });
      await fetchServers();
      return response.data;
    } catch (error) {
      console.error("Failed to create server:", error);
      throw error;
    }
  };

  const joinServer = async (code: string) => {
    try {
      const response = await api.post(`/invites/${code}/join`);
      await fetchServers();
      return response.data;
    } catch (error) {
      console.error("Failed to join server!", error);
      throw error;
    }
  };

  return { servers, loading, refetch: fetchServers, createServer, joinServer };
};
