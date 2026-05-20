import React, { useState, useEffect } from "react";
import { X, Shield, Info, Users, Trash2, Save } from "lucide-react";
import { useRoles, Role } from "../hooks/useRoles";
import { usePermissions, PERMISSION_LIST } from "../hooks/usePermissions";

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  serverName: string;
}

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
  isOpen,
  onClose,
  serverId,
  serverName,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "roles" | "members">(
    "overview",
  );
  const { roles, fetchRoles, createRole, updateRole, deleteRole } =
    useRoles(serverId);
  const { togglePermission } = usePermissions();
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<number>(0);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRolePermissions, setEditRolePermissions] = useState<number>(0);

  useEffect(() => {
    if (isOpen && activeTab === "roles") {
      fetchRoles();
    }
  }, [isOpen, activeTab, fetchRoles]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    await createRole(newRoleName, newRolePermissions);
    setNewRoleName("");
    setNewRolePermissions(0);
  };

  const startEditing = (role: Role) => {
    setEditingRoleId(role.id);
    setEditRoleName(role.name);
    setEditRolePermissions(role.permissions);
  };

  const handleUpdateRole = async () => {
    if (!editingRoleId || !editRoleName.trim()) return;
    await updateRole(editingRoleId, editRoleName, editRolePermissions);
    setEditingRoleId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="bg-brand-beige rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden border-2 border-brand-green">
        <div className="w-1/3 bg-brand-peach/30 border-r border-brand-green p-4 flex flex-col gap-2">
          <h3 className="font-bold text-xs uppercase text-gray-500 mb-2 px-2">
            {serverName} Settings
          </h3>
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === "overview" ? "bg-brand-green text-brand-beige" : "text-gray-700 hover:bg-brand-green/20"}`}
          >
            <Info size={16} /> Overview
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === "roles" ? "bg-brand-green text-brand-beige" : "text-gray-700 hover:bg-brand-green/20"}`}
          >
            <Shield size={16} /> Roles
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === "members" ? "bg-brand-green text-brand-beige" : "text-gray-700 hover:bg-brand-green/20"}`}
          >
            <Users size={16} /> Members
          </button>
        </div>
        <div className="flex-1 flex flex-col relative bg-brand-beige">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-brand-brick transition-colors"
          >
            <X size={24} />
          </button>
          <div className="p-8 h-full overflow-y-auto">
            {activeTab === "overview" && (
              <div>
                <h2 className="text-2xl font-bold text-brand-green mb-6">
                  Server Overview
                </h2>
                <p className="text-gray-600">
                  Settings for {serverName} will go here.
                </p>
              </div>
            )}
            {activeTab === "roles" && (
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-bold text-brand-green mb-6">
                  Server Roles
                </h2>
                <form
                  onSubmit={handleCreateRole}
                  className="bg-white border border-brand-green/30 p-4 rounded-lg shadow-sm mb-6 shrink-0"
                >
                  <h3 className="font-bold text-gray-800 mb-3">
                    Create New Role
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Role Name (e.g. Moderator)"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-brand-green"
                    />
                    <button
                      type="submit"
                      className="bg-brand-green text-brand-beige px-4 py-2 rounded font-bold hover:bg-brand-brick transition-colors"
                    >
                      Create Role
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PERMISSION_LIST.map((flag) => {
                      const hasPerm =
                        (newRolePermissions & flag.value) === flag.value;
                      return (
                        <label
                          key={flag.value}
                          className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={hasPerm}
                            onChange={() =>
                              setNewRolePermissions(
                                togglePermission(
                                  newRolePermissions,
                                  flag.value,
                                ),
                              )
                            }
                            className="w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green"
                          />
                          {flag.label}
                        </label>
                      );
                    })}
                  </div>
                </form>
                <div className="flex-1 overflow-y-auto pr-2">
                  <h3 className="font-bold text-gray-800 mb-3">
                    Existing Roles ({roles.length})
                  </h3>
                  <div className="space-y-3">
                    {roles.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        No custom roles created yet.
                      </p>
                    ) : (
                      roles.map((role) => (
                        <div
                          key={role.id}
                          className="flex flex-col bg-white border border-brand-green/20 p-3 rounded-md shadow-sm"
                        >
                          {editingRoleId === role.id ? (
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editRoleName}
                                  onChange={(e) =>
                                    setEditRoleName(e.target.value)
                                  }
                                  className="flex-1 border border-brand-green rounded px-2 py-1 focus:outline-none"
                                />
                                <button
                                  onClick={handleUpdateRole}
                                  className="p-1.5 bg-brand-green text-white rounded hover:bg-brand-brick transition-colors"
                                >
                                  <Save size={18} />
                                </button>
                                <button
                                  onClick={() => setEditingRoleId(null)}
                                  className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                                {PERMISSION_LIST.map((flag) => {
                                  const hasPerm =
                                    (editRolePermissions & flag.value) ===
                                    flag.value;
                                  return (
                                    <label
                                      key={flag.value}
                                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={hasPerm}
                                        onChange={() =>
                                          setEditRolePermissions(
                                            togglePermission(
                                              editRolePermissions,
                                              flag.value,
                                            ),
                                          )
                                        }
                                        className="w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green"
                                      />
                                      {flag.label}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div
                                className="flex-1 cursor-pointer hover:bg-gray-50 rounded px-1 -ml-1 transition-colors"
                                onClick={() => startEditing(role)}
                              >
                                <p className="font-bold text-brand-green">
                                  {role.name}
                                </p>
                                <p className="text-xs text-gray-500 font-mono">
                                  Perms: {role.permissions}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteRole(role.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Delete Role"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "members" && (
              <div>
                <h2 className="text-2xl font-bold text-brand-green mb-6">
                  Members
                </h2>
                <p className="text-gray-600">
                  Manage members and assign them roles here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
