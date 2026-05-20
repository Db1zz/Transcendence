"use client";

import React, { useState, useEffect, useRef } from "react";
import { FriendsView } from "./FriendsView";
import { NavigationSidebar } from "./navigation/NavigationSideBar";
import Chat from "./Chat";
import ProfileButton from "../components/ProfileButton";
import { HeaderBar } from "./navigation/HeaderBar";
import { LeftBar } from "./navigation/LeftBar";
import RightBar from "./navigation/RightBar";
import { VoiceView } from "./VoiceView";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ServerLeftBar, ChannelCategory } from "./ServerLeftBar";
import { ServerHeader } from "./ServerHeader";
import { MemberList, Member } from "./MemberList";
import api from "../utils/api";
import { IncomingCallNotification } from "./IncomingCallNotification";
import { ArrowUpRight, Phone } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import { useCall } from "../hooks/useCall";
import MobileNavBar from "./MobileNavBar";

const mockMembers: Member[] = [
	{ id: "1", name: "Kaneki", status: "online", role: "Admin" },
	{ id: "2", name: "Touka", status: "idle", role: "Staff" },
	{ id: "3", name: "Hide", status: "offline" },
];

interface MainLayoutProps {
	children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	const { t } = useTranslation();
	const [activeView, setActiveView] = useState<"friends" | "chat" | "voice" | "server">("friends");
	const [inServerVoice, setInServerVoice] = useState(false);
	const { incomingCall, setIncomingCall } = useNotifications();
	const { activeCall, joinOrCreateRoom, joinVoiceChannel } = useCall();
	const [activeDmChannelId, setActiveDmChannelId] = useState<string | null>(null);
	const [activeDmName, setActiveDmName] = useState<string>("");
	const [activeServerId, setActiveServerId] = useState<string | null>(null);
	const [activeServerName, setActiveServerName] = useState<string>("");
	const [activeServerChannelId, setActiveServerChannelId] = useState<string | null>(null);
	const [activeServerChannelName, setActiveServerChannelName] = useState<string>("");
	const [serverCategories, setServerCategories] = useState<ChannelCategory[]>([]);
	const { user, loading } = useAuth();
	const callRedirectHandled = useRef(false);
	const lastServerId = useRef<string | null>(null);

	const fetchServerData = async (serverId: string) => {
		try {
			const response = await api.get(`/organizations/${serverId}/channels`);
			const channels = response.data;
			const textChannels = channels.filter((c: any) => c.type === "TEXT").map((c: any) => ({ id: c.id, name: c.name, type: "text" }));
			const voiceChannels = channels.filter((c: any) => c.type === "VOICE").map((c: any) => ({ id: c.id, name: c.name, type: "voice" }));

			setServerCategories([
				{ id: "text", name: "Text Channels", channels: textChannels },
				{ id: "voice", name: "Voice Channels", channels: voiceChannels },
			]);

			const savedChannelId = localStorage.getItem("activeServerChannelId");
			if (savedChannelId && textChannels.some((c: any) => c.id === savedChannelId)) {
				setActiveServerChannelId(savedChannelId);
				setActiveServerChannelName(localStorage.getItem("activeServerChannelName") || "");
			} else if (textChannels.length > 0) {
				setActiveServerChannelId(textChannels[0].id);
				setActiveServerChannelName(textChannels[0].name);
			}
		} catch (error) {
			console.error("Failed to fetch server channels", error);
		}
	};

	useEffect(() => {
		const savedView = localStorage.getItem("activeView") as any;
		if (savedView) setActiveView(savedView);
		const savedServerId = localStorage.getItem("activeServerId");
		const savedServerName = localStorage.getItem("activeServerName");
		if (savedView === "server" && savedServerId) {
			setActiveServerId(savedServerId);
			lastServerId.current = savedServerId; // Update ref
			setActiveServerName(savedServerName || "");
			fetchServerData(savedServerId);
		}
	}, []);

	useEffect(() => {
		if (activeCall) {
			if (!callRedirectHandled.current && activeView !== "server") {
				setActiveView("voice");
				callRedirectHandled.current = true;
			}
		} else {
			callRedirectHandled.current = false;
			setInServerVoice(false);
			if (activeView === "voice") setActiveView("friends");
		}
	}, [activeCall, activeView]);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (incomingCall) {
			timer = setTimeout(() => {
				setIncomingCall(null);
			}, 15000);
		}
		return () => { if (timer) clearTimeout(timer); };
	}, [incomingCall, setIncomingCall]);

	const handleViewChange = (view: "friends" | "chat" | "voice" | "server") => {
		setActiveView(view);
		localStorage.setItem("activeView", view);
	};

	const handleChatChannelClick = (channelId: string, userName: string) => {
		setActiveDmChannelId(channelId);
		setActiveDmName(userName);
		handleViewChange("chat");
	};

	const handleServerClick = async (serverId: string, serverName: string) => {
		setActiveServerId(serverId);
		lastServerId.current = serverId;
		setActiveServerName(serverName);
		localStorage.setItem("activeServerId", serverId);
		localStorage.setItem("activeServerName", serverName);
		handleViewChange("server");
		await fetchServerData(serverId);
	};

	const handleOpenAddFriends = () => {
		handleViewChange("friends");
	};

	if (loading) return null;

	const isServerCall = activeCall && serverCategories.some(cat =>
		cat.id === "voice" && cat.channels.some(ch => ch.id === activeCall.roomId)
	);

	return (
		<div className="min-h-dvh flex flex-col overflow-hidden relative">
			{activeView === "server" ? (
				<ServerHeader channelName={activeServerChannelName || "general"} />
			) : activeView === "chat" ? (
				<div className="hidden md:block">
					<HeaderBar type="messages" />
				</div>
			) : (
				<HeaderBar type="friends" />
			)}
			<div className={`flex flex-1 min-h-0 overflow-y-auto md:overflow-hidden ${activeView === "chat" || activeView === "friends" ? "flex-col" : "flex-row"} md:flex-row`}>
				<div className={`${activeView === "chat" || activeView === "friends" ? "hidden md:flex" : "flex"} w-[72px] z-30 flex-col overflow-hidden`}>
					<NavigationSidebar
						onChatClick={() => handleViewChange("chat")}
						onFriendsClick={() => handleViewChange("friends")}
						onServerClick={handleServerClick}
					/>
				</div>
				<main className="flex-1 flex flex-col pt-2 px-2 md:p-2 overflow-hidden relative min-h-0">
					<div className="absolute inset-0 bg-brand-green opacity-80 -z-10"></div>
					{activeCall && activeView !== "voice" && !(activeView === "server" && inServerVoice) && (
						<div className="mb-2 mr-2 flex items-center justify-between bg-brand-brick text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse flex-shrink-0">
							<div className="flex items-center gap-2">
								<Phone size={16} />
								<span className="text-sm font-medium">Voice call active</span>
							</div>
							<button
								onClick={() => {
									if (inServerVoice || isServerCall) {
										setInServerVoice(true);
										if (lastServerId.current && activeServerId !== lastServerId.current) {
											setActiveServerId(lastServerId.current);
										}
										handleViewChange("server");
									} else {
										handleViewChange("voice");
									}
								}}
								className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
							>
								Return <ArrowUpRight size={14} />
							</button>
						</div>
					)}
					<div className="flex flex-1 flex-col gap-2 overflow-hidden md:flex-row md:gap-0">
						<div className={`${activeView === "chat" || activeView === "friends" ? "flex" : "hidden md:flex"} w-full md:w-1/5 flex-shrink-0 overflow-hidden relative flex-col max-h-[42dvh] md:max-h-none`}>
							{activeView === "server" ? (
								<ServerLeftBar
									serverId={activeServerId || ""}
									serverName={activeServerName}
									categories={serverCategories}
									activeChannelId={activeServerChannelId || ""}
									onSelectChannel={(c) => {
										setActiveServerChannelId(c.id);
										setActiveServerChannelName(c.name);
										localStorage.setItem("activeServerChannelId", c.id);
										localStorage.setItem("activeServerChannelName", c.name);
										if (c.type === "voice") {
											joinVoiceChannel(c.id);
											setInServerVoice(true);
										} else {
											setInServerVoice(false);
										}
									}}
								/>
							) : (
								<LeftBar
									onFriendsClick={() => handleViewChange("friends")}
									onChatChannelClick={handleChatChannelClick}
									onAddFriendsClick={handleOpenAddFriends}
								/>
							)}
							{user && (
								<div className="hidden md:block mt-auto p-2 z-40">
									<ProfileButton user={user} className="w-full" />
								</div>
							)}
						</div>
						<div className="flex flex-1 min-h-0 overflow-hidden">
							<div className="flex-1 min-h-0">
								{activeView === "server" ? (
									inServerVoice ? (
										<VoiceView />
									) : activeServerChannelId ? (
										<Chat
											personName={`# ${activeServerChannelName}`}
											userId={user?.id || ""}
											channelId={activeServerChannelId}
											hideHeader={true}
										/>
									) : (
										<div className="flex h-full items-center justify-center text-brand-beige">
											No text channels available.
										</div>
									)
								) : activeView === "friends" ? (
								<div className="hidden md:block w-full h-full">
									<FriendsView onOpenChat={async (friend) => {
										if (!user) return;
										try {
											const response = await api.post("/channels", {
												name: null, channelType: "TEXT", organizationId: null, memberIds: [user.id, friend.id],
											});
											setActiveDmChannelId(response.data.id);
											setActiveDmName(friend.name);
											handleViewChange("chat");
										} catch (e) { console.error(e); }
									}} />
								</div>
								) : activeView === "voice" ? (
									<VoiceView />
								) : !activeDmChannelId ? (
									<div className="flex h-full items-center justify-center text-brand-beige">
										{t("home.selectFriendToChat")}
									</div>
								) : (
									<Chat
										personName={activeDmName}
										userId={user?.id || ""}
										channelId={activeDmChannelId}
										onBack={() => handleViewChange("friends")}
									/>
								)}
							</div>
						</div>
						<div className="hidden lg:block w-1/5 flex-shrink-0 overflow-hidden">
							<RightBar>
								{activeView === "server" && <MemberList members={mockMembers} />}
							</RightBar>
						</div>
					</div>
				</main>
			</div>

			{incomingCall && (
				<IncomingCallNotification
					event={incomingCall}
					onAnswer={(roomId) => {
						setIncomingCall(null);
						joinOrCreateRoom(roomId);
					}}
					onReject={() => setIncomingCall(null)}
				/>
			)}

			{/* Mobile navigation - hidden on chat view */}
			{activeView !== "chat" && <MobileNavBar active={activeView} onNavigate={(v) => handleViewChange(v)} />}
		</div>
	);
};

export default MainLayout;