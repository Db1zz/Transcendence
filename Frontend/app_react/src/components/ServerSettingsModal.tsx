import React, { useState } from "react";
import { X, Shield, Info, Users } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"overview" | "roles" | "members">("overview");

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
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold text-sm transition-colors ${
              activeTab === "overview" 
                ? "bg-brand-green text-brand-beige" 
                : "text-gray-700 hover:bg-brand-green/20"
            }`}
          >
            <Info size={16} /> Overview
          </button>
          
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold text-sm transition-colors ${
              activeTab === "roles" 
                ? "bg-brand-green text-brand-beige" 
                : "text-gray-700 hover:bg-brand-green/20"
            }`}
          >
            <Shield size={16} /> Roles
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold text-sm transition-colors ${
              activeTab === "members" 
                ? "bg-brand-green text-brand-beige" 
                : "text-gray-700 hover:bg-brand-green/20"
            }`}
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
                <h2 className="text-2xl font-bold text-brand-green mb-6">Server Overview</h2>
                <p className="text-gray-600">Settings for {serverName} will go here.</p>
              </div>
            )}
            {activeTab === "roles" && (
              <div>
                <h2 className="text-2xl font-bold text-brand-green mb-6">Roles</h2>
                <p className="text-gray-600">
                  This is where we will add the button to create a new role, and render the list of existing roles so we can edit their bitmask permissions!
                </p>
              </div>
            )}
            {activeTab === "members" && (
              <div>
                <h2 className="text-2xl font-bold text-brand-green mb-6">Members</h2>
                <p className="text-gray-600">Manage members and assign them roles here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};