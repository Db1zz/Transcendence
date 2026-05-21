import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  Info,
  Users,
  Trash2,
  Save,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useRoles, Role } from "../hooks/useRoles";
import {
  usePermissions,
  PERMISSION_LIST,
  PERMISSION_FLAGS,
} from "../hooks/usePermissions";
import { useServerMembers } from "../hooks/useServerMembers";
import { useAuth } from "../contexts/AuthContext";

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

  const { togglePermission, hasPermission } = usePermissions();
  const { user } = useAuth();
  const { members, fetchMembers, updateMemberRoles } =
    useServerMembers(serverId);

  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<number>(0);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRolePermissions, setEditRolePermissions] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview");
      fetchRoles();
      fetchMembers();
      setErrorMessage(null);
    }
  }, [isOpen, fetchRoles, fetchMembers]);

  const myMemberProfile = members.find((m) => m.user.id === user?.id);

  const myTotalPermissions =
    myMemberProfile?.roles.reduce((acc, roleId) => {
      const role = roles.find((r) => r.id === roleId);
      return acc | (role ? role.permissions : 0);
    }, 0) || 0;

  const canManageRoles = hasPermission(
    myTotalPermissions,
    PERMISSION_FLAGS.MANAGE_ROLES,
  );

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setErrorMessage(null);

    try {
      await createRole(newRoleName, newRolePermissions);
      setNewRoleName("");
      setNewRolePermissions(0);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error || "An unexpected error occurred.",
      );
    }
  };

  const startEditing = (role: Role) => {
    setEditingRoleId(role.id);
    setEditRoleName(role.name);
    setEditRolePermissions(role.permissions);
    setErrorMessage(null);
  };

  const handleUpdateRole = async () => {
    if (!editingRoleId || !editRoleName.trim()) return;
    setErrorMessage(null);

    try {
      await updateRole(editingRoleId, editRoleName, editRolePermissions);
      setEditingRoleId(null);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Failed to update role.");
    }
  };

  const getActivePermissions = (bitmask: number) => {
    return PERMISSION_LIST.filter((p) => (bitmask & p.value) === p.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 transition-all">
      <div className="bg-[#f2ece9] rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden border border-[#d3c5bd]">
        <div className="w-1/3 bg-[#e8deda]/50 border-r border-[#d3c5bd] p-6 flex flex-col gap-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3 px-2">
            {serverName} Settings
          </h3>
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "overview" ? "bg-brand-green text-brand-beige shadow-sm" : "text-gray-600 hover:bg-[#d3c5bd]/40 hover:text-gray-900"}`}
          >
            <Info size={18} /> Overview
          </button>
          {canManageRoles && (
            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "roles" ? "bg-brand-green text-brand-beige shadow-sm" : "text-gray-600 hover:bg-[#d3c5bd]/40 hover:text-gray-900"}`}
            >
              <Shield size={18} /> Roles
            </button>
          )}
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "members" ? "bg-brand-green text-brand-beige shadow-sm" : "text-gray-600 hover:bg-[#d3c5bd]/40 hover:text-gray-900"}`}
          >
            <Users size={18} /> Members
          </button>
        </div>
        <div className="flex-1 flex flex-col relative bg-[#f2ece9]">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-brand-brick hover:bg-white p-2 rounded-full transition-all shadow-sm"
          >
            <X size={20} />
          </button>
          <div className="p-8 h-full overflow-y-auto scrollbar-hide">
            {errorMessage && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm relative animate-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0" />
                <span className="block sm:inline text-sm font-medium">
                  {errorMessage}
                </span>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {activeTab === "overview" && (
              <div className="animate-in fade-in">
                <h2 className="text-3xl font-extrabold text-brand-green mb-6">
                  Server Overview
                </h2>
                <p className="text-gray-600 text-lg">
                  Settings for {serverName} will go here.
                </p>
              </div>
            )}

            {/* ROLES TAB */}
            {activeTab === "roles" && canManageRoles && (
              <div className="flex flex-col h-full animate-in fade-in">
                <h2 className="text-3xl font-extrabold text-brand-green mb-6">
                  Server Roles
                </h2>
                <form
                  onSubmit={handleCreateRole}
                  className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm mb-8 shrink-0 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-green"></div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-brand-green" /> Create New
                    Role
                  </h3>
                  <div className="flex gap-3 mb-6">
                    <input
                      type="text"
                      placeholder="Role Name (e.g. Moderator)"
                      value={newRoleName}
                      onChange={(e) => {
                        setNewRoleName(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newRoleName.trim()}
                      className="bg-brand-green text-brand-beige px-6 py-2.5 rounded-lg font-bold hover:bg-brand-brick transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      Create Role
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {PERMISSION_LIST.map((flag) => {
                      const hasPerm =
                        (newRolePermissions & flag.value) === flag.value;
                      return (
                        <label
                          key={flag.value}
                          className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer group"
                        >
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${hasPerm ? "bg-brand-green border-brand-green" : "bg-white border-gray-300 group-hover:border-brand-green/50"}`}
                          >
                            {hasPerm && (
                              <X
                                size={14}
                                className="text-white rotate-45"
                                style={{ transform: "rotate(0deg)" }}
                              />
                            )}
                          </div>
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
                            className="hidden"
                          />
                          <span className="font-medium">{flag.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </form>
                <div className="flex-1 overflow-y-auto pr-2 pb-4">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                    <span>Existing Roles</span>
                    <span className="bg-brand-green/10 text-brand-green py-0.5 px-2.5 rounded-full text-xs">
                      {roles.length} Roles
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {roles.length === 0 ? (
                      <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                        <Shield
                          size={40}
                          className="mx-auto text-gray-300 mb-3"
                        />
                        <p className="text-gray-500 font-medium">
                          No custom roles created yet.
                        </p>
                      </div>
                    ) : (
                      roles.map((role) => (
                        <div
                          key={role.id}
                          className="group flex flex-col bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                          {editingRoleId === role.id ? (
                            <div className="flex flex-col gap-4 animate-in fade-in">
                              <div className="flex items-center gap-3">
                                <input
                                  type="text"
                                  value={editRoleName}
                                  onChange={(e) => {
                                    setEditRoleName(e.target.value);
                                    setErrorMessage(null);
                                  }}
                                  className="flex-1 bg-gray-50 border border-brand-green rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-gray-800"
                                />
                                <button
                                  onClick={handleUpdateRole}
                                  className="p-2 bg-brand-green text-white rounded-lg hover:bg-brand-brick transition-all shadow-sm flex items-center gap-1.5 px-4 font-bold text-sm"
                                >
                                  <Save size={16} /> Save
                                </button>
                                <button
                                  onClick={() => setEditingRoleId(null)}
                                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm px-4"
                                >
                                  Cancel
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                {PERMISSION_LIST.map((flag) => {
                                  const hasPerm =
                                    (editRolePermissions & flag.value) ===
                                    flag.value;
                                  return (
                                    <label
                                      key={flag.value}
                                      className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer group"
                                    >
                                      <div
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${hasPerm ? "bg-brand-green border-brand-green" : "bg-white border-gray-300 group-hover:border-brand-green/50"}`}
                                      >
                                        {hasPerm && (
                                          <X
                                            size={14}
                                            className="text-white"
                                            style={{
                                              transform: "rotate(0deg)",
                                            }}
                                          />
                                        )}
                                      </div>
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
                                        className="hidden"
                                      />
                                      <span className="font-medium">
                                        {flag.label}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-4">
                              <div
                                className="flex-1 cursor-pointer rounded transition-colors"
                                onClick={() => startEditing(role)}
                              >
                                <p className="font-bold text-brand-green text-lg mb-1">
                                  {role.name}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {getActivePermissions(role.permissions).map(
                                    (p) => (
                                      <span
                                        key={p.value}
                                        className="px-2.5 py-0.5 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                      >
                                        {p.label}
                                      </span>
                                    ),
                                  )}
                                  {role.permissions === 0 && (
                                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                      No Permissions
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await deleteRole(role.id);
                                  } catch (err: any) {
                                    setErrorMessage(
                                      err.response?.data?.error ||
                                        "Failed to delete role",
                                    );
                                  }
                                }}
                                className="p-2.5 text-gray-400 hover:text-brand-brick hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
              <div className="flex flex-col h-full animate-in fade-in">
                <h2 className="text-3xl font-extrabold text-brand-green mb-6">
                  Server Members
                </h2>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                  <div className="grid grid-cols-12 gap-4 bg-gray-50 p-4 border-b border-gray-200 font-bold text-xs uppercase tracking-wider text-gray-500">
                    <div className="col-span-5">User</div>
                    <div className="col-span-7">Roles</div>
                  </div>
                  <div className="overflow-y-auto p-2 space-y-1">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="grid grid-cols-12 gap-4 items-center p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="col-span-5 flex items-center gap-3">
                          <img
                            src={
                              member.user.picture ||
                              "https://i.pinimg.com/1200x/c4/a4/36/c4a4365f7c98dc3b4b26fbad20da527d.jpg"
                            }
                            alt={member.user.username}
                            className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                          />
                          <div>
                            <p className="font-bold text-gray-800 text-sm">
                              {member.user.displayName || member.user.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{member.user.username}
                            </p>
                          </div>
                        </div>
                        <div className="col-span-7 flex flex-wrap gap-2 items-center">
                          {member.roles.map((roleId) => {
                            const role = roles.find((r) => r.id === roleId);
                            if (!role) return null;
                            return (
                              <span
                                key={role.id}
                                className="flex items-center gap-1 px-2.5 py-1 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded text-xs font-bold"
                              >
                                {role.name}
                                {canManageRoles && (
                                  <button
                                    onClick={() =>
                                      updateMemberRoles(
                                        member.id,
                                        member.roles.filter(
                                          (id) => id !== role.id,
                                        ),
                                      )
                                    }
                                    className="hover:text-brand-brick ml-1"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </span>
                            );
                          })}
                          {canManageRoles && (
                            <div className="relative inline-block">
                              <select
                                className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 rounded text-xs font-bold px-3 py-1 pr-6 cursor-pointer focus:outline-none transition-colors"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    updateMemberRoles(member.id, [
                                      ...member.roles,
                                      e.target.value,
                                    ]);
                                  }
                                }}
                              >
                                <option value="" disabled>
                                  + Add Role
                                </option>
                                {roles
                                  .filter((r) => !member.roles.includes(r.id))
                                  .map((role) => (
                                    <option key={role.id} value={role.id}>
                                      {role.name}
                                    </option>
                                  ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500">
                                <Plus size={12} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
