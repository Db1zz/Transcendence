import { useState, useCallback } from "react";
import api from "../utils/api";

export interface ServerMember {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    picture?: string;
    status: string;
  };
  roles: string[];
  joinedAt: string;
}

export const useServerMembers = (organizationId: string | null) => {
  const [members, setMembers] = useState<ServerMember[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const response = await api.get(
        `/organizations/${organizationId}/members`,
      );
      setMembers(response.data);
    } catch (error) {
      console.error("Failed to fetch server members:", error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const updateMemberRoles = async (memberId: string, roleIds: string[]) => {
    try {
      await api.put(`/members/${memberId}/roles`, roleIds);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, roles: roleIds } : m)),
      );
    } catch (error) {
      console.error("Failed to update member roles:", error);
      throw error;
    }
  };

  return { members, loading, fetchMembers, updateMemberRoles };
};
