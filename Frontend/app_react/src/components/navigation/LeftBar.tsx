import React from "react";
import bgLSideBar from "../../img/bg_l_sidebar.png";
import { Contact, MessageSquare, UserPlus } from "lucide-react";
import { NotificationBadge } from "../NotificationBadge";
import { useNotifications } from "../../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import { useChatChannels } from "../../hooks/useChatChannels";

interface LeftBarProps {
	onFriendsClick?: () => void;
	onChatChannelClick?: (channelId: string, userName: string) => void;
	onAddFriendsClick?: () => void;
}

export const LeftBar: React.FC<LeftBarProps> = ({
	onFriendsClick,
	onChatChannelClick,
	onAddFriendsClick,
}) => {
	const { getUnreadCount, setActiveTarget } = useNotifications();

	const handleFriendsClick = () => {
		if (onFriendsClick) {
			onFriendsClick();
		}
		setActiveTarget(null);
	};
	const { t } = useTranslation();
	const { chatChannels, loading, error } = useChatChannels();

	return (
		<div className="h-full rounded-none md:rounded-l-lg p-4 border border-brand-green md:border-brand-green border-x-0 md:border-x relative overflow-hidden flex flex-col">
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{ backgroundImage: `url(${bgLSideBar})` }}
			/>
			<div className="absolute inset-0 bg-brand-peach opacity-90" />
			<div className="relative z-10 flex flex-col gap-4 h-full">
				<div className="hidden md:flex md:flex-col gap-2 md:gap-3">
					<button
						type="button"
						onClick={handleFriendsClick}
						className="w-full flex items-center gap-3 rounded-lg border border-brand-green/70 bg-brand-beige/90 px-3 py-2 text-brand-green font-semibold shadow-sm transition-colors hover:bg-brand-peach hover:border-brand-green"
					>
						<span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-peach/60">
							<Contact size={18} className="text-brand-green" />
						</span>
						<span className="text-left">{t("friends.friendsList")}</span>
					</button>
					<button
						type="button"
						onClick={onAddFriendsClick}
						className="w-full flex items-center gap-3 rounded-lg border border-brand-green/70 bg-brand-brick/90 px-3 py-2 text-brand-beige font-semibold shadow-sm transition-colors hover:bg-brand-brick hover:border-brand-green md:hidden"
					>
						<span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-beige/20">
							<UserPlus size={18} className="text-brand-beige" />
						</span>
						<span className="text-left">{t("friends.addFriend")}</span>
					</button>
				</div>

				<div className="flex-1 flex flex-col min-h-0">
					<div className="flex items-center gap-2 mb-3 px-1">
						<MessageSquare size={16} className="text-brand-green" />
						<h3 className="text-brand-green font-semibold text-sm">
							{t("friends.chats")}
						</h3>
					</div>
					<div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-brand-green/30 scrollbar-track-transparent">
						{loading ? (
							<div className="text-brand-green/70 text-sm text-center py-4">
								{t("friends.loadingChats")}
							</div>
						) : error ? (
							<div className="text-brand-green/70 text-sm text-center py-4">
								{error}
							</div>
						) : chatChannels.length === 0 ? (
							<div className="text-brand-green/70 text-sm text-center py-4">
								{t("friends.noChats")}
							</div>
						) : (
							chatChannels.map((channel) => (
								<button
									key={channel.channelId}
									type="button"
									onClick={() => {
										onChatChannelClick?.(
											channel.channelId,
											channel.otherUserName,
										);
										setActiveTarget(channel.channelId);
									}}
									className="w-full flex items-center gap-3 rounded-lg border border-brand-green/50 bg-brand-beige/80 px-3 py-2 text-left transition-colors hover:bg-brand-beige hover:border-brand-green"
								>
									<NotificationBadge
										count={getUnreadCount(channel.channelId) || 0}
									>
										<img
											src={channel.otherUserPicture}
											alt={channel.otherUserName}
											className="h-8 w-8 rounded-full object-cover border border-brand-green/30"
										/>
									</NotificationBadge>
									<div className="flex-1 min-w-0">
										<p className="text-brand-green font-medium text-sm truncate">
											{channel.otherUserName}
										</p>
									</div>
								</button>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
