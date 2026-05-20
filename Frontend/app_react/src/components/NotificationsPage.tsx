import React, { useMemo } from "react";
import { Bell, Clock3, MessageSquareText, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { useNotifications } from "../contexts/NotificationContext";
import { useFriends } from "../hooks/useFriends";

type NotificationRow = {
	id: string;
	title: string;
	message: string;
	subtitle: string;
	badge: string;
	avatarUrl: string;
	icon: React.ReactNode;
};

const safeParse = (payload: unknown): Record<string, unknown> | null => {
	if (!payload || typeof payload !== "string") {
		return typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : null;
	}

	try {
		return JSON.parse(payload) as Record<string, unknown>;
	} catch (error) {
		console.error("Failed to parse notification payload", error);
		return null;
	}
};

const getSenderName = (senderId: string | undefined, friends: Array<{ id: string; name: string; picture?: string }>) => {
	if (!senderId) return "Someone";
	const friend = friends.find((item) => item.id === senderId);
	return friend?.name || `User ${senderId.slice(0, 8)}`;
};

export const NotificationsPage: React.FC = () => {
	const { t } = useTranslation();
	const { notifications, dismissNotification, dismissNotifications } = useNotifications();
	const { friends } = useFriends();

	const rows = useMemo<NotificationRow[]>(() => {
		return notifications.map((item) => {
			const payload = safeParse(item.payload);
			const senderId = typeof payload?.sender_id === "string" ? payload.sender_id : undefined;
			const senderName = getSenderName(senderId, friends);
			const avatarUrl = friends.find((friend) => friend.id === senderId)?.picture || `https://api.dicebear.com/7.x/identicon/svg?seed=${senderId || item.id}`;

			if (item.etype === "JOIN_CALL_CREATED") {
				return {
					id: item.id,
					title: t("voice.incomingCall", "Incoming call"),
					message: `${senderName} started a call.`,
					subtitle: t("notifications.callSubtitle", "Tap to review or dismiss"),
					badge: t("notifications.live", "live"),
					avatarUrl,
					icon: <Bell className="h-5 w-5 text-brand-beige" />,
				};
			}

			return {
				id: item.id,
				title: t("notifications.genericTitle", "Notification"),
				message: typeof payload?.content === "string" ? payload.content : t("notifications.genericBody", "You have a new update."),
				subtitle: senderName,
				badge: item.scope,
				avatarUrl,
				icon: <MessageSquareText className="h-5 w-5 text-brand-beige" />,
			};
		});
	}, [friends, notifications, t]);

	return (
		<div className="flex h-full min-h-0 w-full flex-col bg-brand-beige border-0 md:border md:border-brand-green">
			<div className="flex items-center justify-between gap-3 border-b-2 border-gray-800 bg-brand-peach px-4 py-3">
				<div className="flex items-center gap-3 min-w-0">
					<div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-800 bg-brand-green shadow-sharp-sm">
						<Bell className="h-5 w-5 text-brand-beige" />
					</div>
					<div className="min-w-0">
						<h2 className="truncate font-ananias text-lg font-bold uppercase text-gray-800">
							{t("notifications.title", "notifications")}
						</h2>
						<p className="truncate font-roboto text-xs text-gray-600">
							{t("notifications.subtitle", "Non-message alerts from the app")}
						</p>
					</div>
				</div>

				{notifications.length > 0 && (
					<Button
						onClick={() => dismissNotifications(rows.map((item) => item.id))}
						color="bg-brand-brick"
						className="!px-3 !py-2 !text-xs whitespace-nowrap"
					>
						clear all
					</Button>
				)}
			</div>

			<div className="flex-1 overflow-y-auto p-3 pb-24">
				{rows.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-800/30 bg-white/60 px-6 py-12 text-center shadow-sharp-sm">
						<div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-800 bg-brand-green">
							<Clock3 className="h-6 w-6 text-brand-beige" />
						</div>
						<div>
							<h3 className="font-ananias text-base font-bold uppercase text-gray-800">
								{t("notifications.emptyTitle", "no notifications yet")}
							</h3>
							<p className="mt-1 font-roboto text-sm text-gray-600">
								{t("notifications.emptyBody", "messages stay out of this view. other alerts will appear here.")}
							</p>
						</div>
					</div>
				) : (
					<div className="space-y-3">
						{rows.map((item) => (
							<article
								key={item.id}
								className="overflow-hidden rounded-2xl border-2 border-gray-800 bg-white shadow-sharp-sm"
							>
								<div className="flex gap-3 p-3">
									<div className="relative shrink-0">
										<img
											src={item.avatarUrl}
											alt={item.subtitle}
											className="h-12 w-12 rounded-full border-2 border-gray-800 object-cover bg-gray-200"
										/>
										<div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand-beige bg-brand-brick">
											{item.icon}
										</div>
									</div>

									<div className="min-w-0 flex-1">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<div className="flex items-center gap-2">
													<p className="truncate font-ananias text-sm font-bold uppercase tracking-wide text-gray-800">
														{item.title}
													</p>
													<span className="shrink-0 rounded-full border border-gray-800/20 bg-brand-green/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">
														{item.badge}
													</span>
												</div>
												<p className="mt-0.5 text-[11px] font-roboto text-gray-500">
													{item.subtitle}
												</p>
											</div>

											<button
												type="button"
												onClick={() => dismissNotification(item.id)}
												aria-label="Dismiss notification"
												className="rounded-lg border-2 border-transparent p-1 text-gray-500 transition-colors hover:border-gray-800 hover:bg-brand-brick hover:text-brand-beige"
											>
												<X className="h-4 w-4" />
											</button>
										</div>

										<p className="mt-2 font-roboto text-sm leading-5 text-gray-700">
											{item.message}
										</p>
									</div>
								</div>
							</article>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default NotificationsPage;