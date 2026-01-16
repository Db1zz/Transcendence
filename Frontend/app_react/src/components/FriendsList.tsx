import {
  Search,
  Users,
  MessageCircle,
  MoreVertical,
  Ban,
  Check,
  X,
} from "lucide-react";
import { Friend, FriendsTab } from "./FriendsView";
import { ProfileButton } from "./ProfileButton";
import { Button } from "./Button";

interface FriendsListProps {
  friends: Friend[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: FriendsTab;
}

const getTabTitle = (tab: FriendsTab, count: number): string => {
  switch (tab) {
    case "online":
      return `Online - ${count}`;
    case "all":
      return `All friends - ${count}`;
    case "pending":
      return `Pending - ${count}`;
    case "blocked":
      return `Blocked - ${count}`;
    default:
      return "";
  }
};

export const FriendsList: React.FC<FriendsListProps> = ({
  friends,
  searchQuery,
  onSearchChange,
  activeTab,
}) => {
  return (
    <div className="flex flex-col h-full p-6">
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search friends."
          className="w-full px-4 py-3 pl-11 bg-brand-green border-2 border-gray-800 rounded-lg font-roboto text-gray-800 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-brick shadow-sharp-xs transition-all duration-150"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      </div>
      <h3 className="font-ananias text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">
        {getTabTitle(activeTab, friends.length)}
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {friends.length > 0 ? (
          friends.map((friend, index) => (
            <div
              key={friend.id}
              className="animate-enter"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProfileButton user={friend} className="w-full">
                {activeTab === "pending" ? (
                  <>
                    <Button
                      color="bg-green-600"
                      onClick={() => console.log("Accept", friend.id)}
                      className="!p-2 !rounded-full !shadow-[2px_2px_0px_#000]"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      color="bg-red-500"
                      onClick={() => console.log("Decline", friend.id)}
                      className="!p-2 !rounded-full !shadow-[2px_2px_0px_#000]"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      color="bg-gray-200"
                      onClick={() => console.log("Message", friend.id)}
                      className="!p-2 !rounded-full !border-gray-800 !text-gray-800 hover:!bg-brand-brick hover:!text-brand-beige !shadow-[2px_2px_0px_#000]"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>

                    {activeTab === "blocked" ? (
                      <Button
                        color="bg-red-200"
                        onClick={() => console.log("Unblock", friend.id)}
                        className="!p-2 !rounded-full !border-gray-800 !text-red-800 hover:!bg-red-500 hover:!text-white !shadow-[2px_2px_0px_#000]"
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        color="bg-transparent"
                        onClick={() => console.log("Options", friend.id)}
                        className="!p-2 !rounded-full !border-transparent !text-gray-500 hover:!bg-gray-200 !shadow-none hover:!shadow-none hover:translate-x-0 hover:translate-y-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
              </ProfileButton>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-beige border-2 border-gray-800 flex items-center justify-center mb-4 shadow-sharp-sm">
              <Users className="w-10 h-10 text-brand-brick" />
            </div>
            <h4 className="font-ananias font-bold text-lg text-gray-800 mb-1">
              noone here
            </h4>
          </div>
        )}
      </div>
    </div>
  );
};
