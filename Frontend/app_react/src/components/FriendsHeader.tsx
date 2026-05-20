import { Users, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
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

export const FriendsHeader: React.FC<FriendsHeaderProps> = ({
	activeTab,
	onTabChange,
	counts,
}) => {
	const { t } = useTranslation();
	const tabs: { id: FriendsTab; label: string }[] = [
		{ id: "online", label: t("friends.tabs.online") },
		{ id: "all", label: t("friends.tabs.all") },
		{ id: "pending", label: t("friends.tabs.pending") },
		{ id: "blocked", label: t("friends.tabs.blocked") },
	];

	return (
		<div className="flex flex-col gap-3 px-3 py-3 border-b-2 border-gray-800 bg-brand-peach sm:flex-row sm:items-center sm:gap-4 sm:px-4">
			<div className="flex items-center gap-2 sm:pr-4 sm:border-r-2 border-gray-800">
				<Users className="hidden sm:inline w-5 h-5 text-gray-800" />
				<span className="hidden sm:inline font-ananias font-bold text-gray-800 text-sm sm:text-base">
					{t("friends.title")}
				</span>
			</div>
			<nav className="flex items-center gap-2 overflow-x-auto pb-1 sm:overflow-x-visible sm:pb-0 sm:gap-1">
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
							className={`!px-3 sm:!px-4 !py-1.5 !text-xs sm:!text-sm !font-bold whitespace-nowrap ${isActive ? "text-brand-beige" : "!text-gray-600 !shadow-none !border-transparent hover:!bg-gray-800/5 hover:!text-gray-900"}`}
						/>
					);
				})}
			</nav>
			<div className="sm:ml-auto">
				<Button
					onClick={() => onTabChange("add")}
					color={activeTab === "add" ? "bg-brand-green" : "bg-brand-brick"}
					className="w-full sm:w-auto !px-4 !py-1.5 !text-sm flex items-center justify-center gap-2"
				>
					<UserPlus className="w-4 h-4" />
					<span>{t("friends.addFriend")}</span>
				</Button>
			</div>
		</div>
	);
};
