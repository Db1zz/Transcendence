import { useCallback } from "react";

export const PERMISSION_FLAGS = {
  ADMINISTRATOR: 1,
  MANAGE_CHANNELS: 1 << 1,
  MANAGE_ROLES: 1 << 2,
  SEND_MESSAGES: 1 << 3,
  CONNECT_VOICE: 1 << 4,
};

export const PERMISSION_LIST = [
  { label: "Administrator", value: PERMISSION_FLAGS.ADMINISTRATOR },
  { label: "Manage Channels", value: PERMISSION_FLAGS.MANAGE_CHANNELS },
  { label: "Manage Roles", value: PERMISSION_FLAGS.MANAGE_ROLES },
  { label: "Send Messages", value: PERMISSION_FLAGS.SEND_MESSAGES },
  { label: "Connect Voice", value: PERMISSION_FLAGS.CONNECT_VOICE },
];

export const usePermissions = () => {
  const hasPermission = useCallback(
    (userBitmask: number, requiredPermission: number) => {
      if (
        (userBitmask & PERMISSION_FLAGS.ADMINISTRATOR) ===
        PERMISSION_FLAGS.ADMINISTRATOR
      ) {
        return true;
      }

      return (userBitmask & requiredPermission) === requiredPermission;
    },
    [],
  );

  const togglePermission = useCallback(
    (currentBitmask: number, permissionToToggle: number) => {
      if ((currentBitmask & permissionToToggle) === permissionToToggle) {
        return currentBitmask & ~permissionToToggle;
      }

      return currentBitmask | permissionToToggle;
    },
    [],
  );

  return {
    hasPermission,
    togglePermission,
  };
};
