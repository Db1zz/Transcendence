import { Users, UserPlus } from "lucide-react";
import { FriendsTab } from "./FriendsView";
import { Button } from "./Button";

interface FriendsHeaderProps {
  activeTab: FriendsTab;
  onTabChange: (tab: FriendsTab) => void;
  counts: {
    online: number;
    all: number;
    pending: number;
    blocked: number;
  };
}

const tabs: { id: FriendsTab; label: string }[] = [
  { id: "online", label: "Online" },
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "blocked", label: "Blocked" },
];

export const FriendsHeader: React.FC<FriendsHeaderProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b-2 border-gray-800 bg-brand-peach">
      <div className="flex items-center gap-2 pr-4 border-r-2 border-gray-800">
        <Users className="w-5 h-5 text-gray-800" />
        <span className="font-ananias font-bold text-gray-800">Friends</span>
      </div>
      <nav className="flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id as keyof typeof counts];

          return (
            <Button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              text={
                tab.id !== "add"
                  ? `${tab.label} ${count > 0 || tab.id === "online" ? `(${count})` : ""}`
                  : tab.label
              }
              color={isActive ? "bg-brand-brick" : "bg-transparent"}
              className={`!px-4 !py-1.5 !text-sm !font-bold ${isActive ? "text-brand-beige" : "!text-gray-600 !shadow-none !border-transparent hover:!bg-gray-800/5 hover:!text-gray-900"}`}
            />
          );
        })}
      </nav>
      <div className="ml-auto">
        <Button
          onClick={() => onTabChange("add")}
          color={activeTab === "add" ? "bg-brand-green" : "bg-brand-brick"}
          className="!px-4 !py-1.5 !text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Friend</span>
        </Button>
      </div>
    </div>
  );
};
