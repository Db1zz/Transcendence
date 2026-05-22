import React, {
	useRef,
	useEffect,
	useState,
	useCallback,
	useMemo,
} from "react";

import {
	Mic,
	MicOff,
	Video,
	VideoOff,
	Headphones, // Added for the "On" state
	HeadphoneOff,
	Phone,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import { useCall } from "../hooks/useCall";
import defaultAvatar from "../img/default.png";

export interface VoiceParticipant {
	id: string;
	username: string;
	displayName?: string;
	picture?: string;
}

const FALLBACK_COLORS = [
	"bg-brand-beige",
	"bg-brand-peach",
	"bg-brand-brick",
] as const;

const getSeededIndex = (seed: string, length: number) => {
	let hash = 0;
	for (let index = 0; index < seed.length; index += 1) {
		hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
	}
	return hash % length;
};

const getFallbackColor = (peerId: string) =>
	FALLBACK_COLORS[getSeededIndex(peerId, FALLBACK_COLORS.length)];

const IconMicOn = () => <Mic size={20} />;
const IconMicOff = () => <MicOff size={20} />;
const IconCamOn = () => <Video size={20} />;
const IconCamOff = () => <VideoOff size={20} />;
const IconHeadphonesOn = () => <Headphones size={20} />;
const IconHeadphoneOff = () => <HeadphoneOff size={20} />;
const IconPhoneOff = () => <Phone size={20} />;

interface VideoTileProps {
	peerId: string;
	stream: MediaStream;
	displayName: string;
	avatarUrl?: string;
	showVideo?: boolean;
	isLocal?: boolean;
	isSelected?: boolean;
	isDeafened?: boolean;
	onClick?: (peerId: string) => void;
	className?: string;
}

const VideoTile: React.FC<VideoTileProps> = ({
	peerId,
	stream,
	displayName,
	avatarUrl,
	showVideo,
	isLocal,
	isSelected,
	isDeafened,
	onClick,
	className = "",
}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const hasActiveVideo =
		showVideo ??
		(stream.getVideoTracks().length > 0 &&
			stream
				.getVideoTracks()
				.some((track) => track.readyState === "live" && track.enabled));
	const fallbackColor = getFallbackColor(peerId);

	useEffect(() => {
		if (videoRef.current && videoRef.current.srcObject !== stream) {
			videoRef.current.srcObject = stream;
		}
		if (videoRef.current && hasActiveVideo) {
			videoRef.current.play().catch(() => { });
		}
	}, [stream, hasActiveVideo]);

	return (
		<div
			className={`relative aspect-video rounded-xl overflow-hidden shadow-lg border-2 transition-all cursor-pointer ${fallbackColor} ${isSelected
					? "border-brand-peach"
					: "border-transparent hover:border-brand-brick"
				} ${className}`}
			onClick={() => onClick?.(peerId)}
		>
			{hasActiveVideo ? (
				<video
					ref={videoRef}
					playsInline
					autoPlay
					muted={isLocal || isDeafened}
					className="w-full h-full object-cover"
				/>
			) : (
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="relative flex h-full w-full items-center justify-center p-4">
						<div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-brand-beige bg-brand-beige shadow-sm sm:h-32 sm:w-32 md:h-36 md:w-36">
							{avatarUrl ? (
								<img
									src={avatarUrl}
									alt={displayName}
									className="h-full w-full rounded-full object-cover bg-white"
									onError={(event) => {
										event.currentTarget.src = defaultAvatar;
									}}
								/>
							) : (
								<span className="font-ananias text-3xl font-bold text-brand-brick sm:text-4xl">
									{displayName.charAt(0).toUpperCase() || "?"}
								</span>
							)}
						</div>
					</div>
				</div>
			)}
			<div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
				{displayName}
			</div>
		</div>
	);
};

interface VoiceViewProps {
	onLeave?: () => void;
	participants?: VoiceParticipant[];
	localParticipant?: VoiceParticipant | null;
}

export const VoiceView: React.FC<VoiceViewProps> = ({
	onLeave,
	participants = [],
	localParticipant = null,
}) => {
	const { t } = useTranslation();
	const { localStream, remoteStreams, leaveRoom } = useCall();

	const [micEnabled, setMicEnabled] = useState(true);
	const [camEnabled, setCamEnabled] = useState(false);
	const [deafened, setDeafened] = useState(false);

	const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);

	const participantMap = useMemo(() => {
		return new Map(
			participants.map((participant) => [participant.id, participant]),
		);
	}, [participants]);

	const remoteParticipants = useMemo(
		() => participants.filter((participant) => participant.id !== localParticipant?.id),
		[participants, localParticipant],
	);

	useEffect(() => {
		if (localStream) {
			localStream.getAudioTracks().forEach((track) => {
				track.enabled = micEnabled;
			});
		}
	}, [localStream, micEnabled]);

	useEffect(() => {
		if (localStream) {
			localStream.getVideoTracks().forEach((track) => {
				track.enabled = camEnabled;
			});
		}
	}, [localStream, camEnabled]);

	const toggleMic = () => setMicEnabled((prev) => !prev);
	const toggleVideo = () => setCamEnabled((prev) => !prev);
	const toggleAudio = () => setDeafened((prev) => !prev);

	const allStreams = useMemo(() => {
		const combined = new Map(remoteStreams);
		if (localStream) combined.set("local", localStream);
		return combined;
	}, [remoteStreams, localStream]);

	useEffect(() => {
		if (selectedPeerId && !allStreams.has(selectedPeerId)) {
			setSelectedPeerId(null);
		}
	}, [allStreams, selectedPeerId]);

	const handleTileClick = useCallback((peerId: string) => {
		setSelectedPeerId((prev) => (prev === peerId ? null : peerId));
	}, []);

	const handleLeaveClick = () => {
		if (onLeave) {
			onLeave();
		}
		leaveRoom();
	};

	const resetSelection = useCallback(() => setSelectedPeerId(null), []);

	const renderTile = (
		peerId: string,
		stream: MediaStream,
		className = "",
		selected = false,
		fallbackIndex?: number,
	) => {
		const participant =
			peerId === "local"
				? localParticipant
				: participantMap.get(peerId) ||
				(fallbackIndex !== undefined ? remoteParticipants[fallbackIndex] : undefined);
		const displayName =
			peerId === "local"
				? t("voice.you")
				: participant?.username ||
				participant?.displayName ||
				t("voice.user", { id: peerId.slice(0, 4) });

		return (
			<VideoTile
				peerId={peerId}
				stream={stream}
				displayName={displayName}
				avatarUrl={participant?.picture || defaultAvatar}
				showVideo={peerId !== "local" || camEnabled}
				isLocal={peerId === "local"}
				isDeafened={deafened}
				isSelected={selected}
				onClick={selected ? resetSelection : handleTileClick}
				className={className}
			/>
		);
	};

	const renderControls = () => (
		<div className="flex items-center gap-3">
			<div className="flex items-center gap-3 rounded-lg border border-brand-brick/70 bg-brand-beige/90 px-3 py-2 text-brand-green font-semibold shadow-sm transition-colors hover:bg-brand-peach hover:border-brand-green">
				<button
					onClick={toggleMic}
					className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${micEnabled
							? "hover:bg-brand-green text-white bg-brand-green/20"
							: "hover:bg-brand-brick text-white bg-brand-brick"
						}`}
					aria-label={micEnabled ? t("voice.mute") : t("voice.unmute")}
				>
					{micEnabled ? <IconMicOn /> : <IconMicOff />}
				</button>

				<button
					onClick={toggleAudio}
					className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${!deafened
							? "hover:bg-brand-green text-white bg-brand-green/20"
							: "hover:bg-brand-brick text-white bg-brand-brick"
						}`}
					aria-label={
						deafened ? t("voice.headphonesOn") : t("voice.headphonesOff")
					}
				>
					{deafened ? <IconHeadphoneOff /> : <IconHeadphonesOn />}
				</button>

				<button
					onClick={toggleVideo}
					className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${camEnabled
							? "hover:bg-brand-green text-white bg-brand-green/20"
							: "hover:bg-brand-brick text-white bg-brand-brick"
						}`}
					aria-label={camEnabled ? t("voice.cameraOff") : t("voice.cameraOn")}
				>
					{camEnabled ? <IconCamOn /> : <IconCamOff />}
				</button>
			</div>
			<div className="flex items-center rounded-lg border border-brand-brick/70 bg-red-700 px-3 py-2 shadow-sm hover:bg-red-800">
				<button
					onClick={handleLeaveClick}
					className="w-10 h-10 text-white flex items-center justify-center"
					aria-label={t("voice.endCall")}
				>
					<IconPhoneOff />
				</button>
			</div>
		</div>
	);

	const renderGridView = () => {
		const tiles = Array.from(allStreams.entries()).map(([peerId, stream]) => (
			<div
				key={peerId}
				className="w-full sm:w-64 md:w-72 lg:w-80 flex-shrink-0"
			>
				{renderTile(peerId, stream, "", false, undefined)}
			</div>
		));

		return (
			<div className="flex flex-wrap justify-center gap-4 w-full">{tiles}</div>
		);
	};

	const renderFocusView = () => {
		const mainStream = allStreams.get(selectedPeerId!);
		if (!mainStream) return null;

		const otherTiles = Array.from(allStreams.entries()).filter(
			([id]) => id !== selectedPeerId,
		);

		return (
			<div className="flex flex-col w-full h-full gap-2">
				<div className="flex-1 min-h-0">
					{renderTile(selectedPeerId!, mainStream, "w-full h-full", true, 0)}
				</div>
				{otherTiles.length > 0 && (
					<div className="h-24 sm:h-28 md:h-32 flex-shrink-0 w-full overflow-x-auto">
						<div className="flex gap-2 h-full w-max flex-nowrap">
							{otherTiles.map(([peerId, stream], index) => (
								<div
									key={peerId}
									className="h-full w-32 sm:w-36 md:w-40 flex-shrink-0"
								>
									{renderTile(peerId, stream, "w-full h-full", false, index)}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="flex flex-col w-full h-full min-h-[80vh] bg-brand-green p-4">
			<div className="flex-1 min-h-0 overflow-y-auto">
				<div className="flex flex-col w-full h-full">
					{selectedPeerId ? (
						renderFocusView()
					) : (
						<div className="mt-auto mb-auto w-full">{renderGridView()}</div>
					)}
				</div>
			</div>

			<div className="flex-shrink-0 flex justify-center mt-4">
				{renderControls()}
			</div>
		</div>
	);
};
