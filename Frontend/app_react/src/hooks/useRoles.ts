import { useState, useCallback } from "react";
import api from "../utils/api";

export interface Role {
  id: string;
  name: string;
  organizationId: string;
  permissions: number;
  createdAt: string;
}

export const useRoles = (organizationId: string) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const response = await api.get(`/organizations/${organizationId}/roles`);
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const createRole = async (name: string, permissions: number = 0) => {
    try {
      const response = await api.post("/roles", {
        name,
        organizationId,
        permissions,
      });
      setRoles((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error("Failed to create role:", error);
      throw error;
    }
  };

  const updateRole = async (
    roleId: string,
    name: string,
    permissions: number,
  ) => {
    try {
      const response = await api.patch(`/roles/${roleId}`, {
        name,
        permissions,
      });
      setRoles((prev) =>
        prev.map((r) => (r.id === roleId ? response.data : r)),
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update role:", error);
      throw error;
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      await api.delete(`/roles/${roleId}`);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    } catch (error) {
      console.error("Failed to delete role:", error);
      throw error;
    }
  };

  return { roles, loading, fetchRoles, createRole, updateRole, deleteRole };
};
