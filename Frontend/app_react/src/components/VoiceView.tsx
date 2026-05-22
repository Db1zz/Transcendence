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
  Headphones,
  HeadphoneOff,
  Phone,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import { useCall } from "../hooks/useCall";

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
  isLocal,
  isSelected,
  isDeafened,
  onClick,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`relative aspect-video bg- rounded-xl overflow-hidden shadow-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-brand-peach"
          : "border-transparent hover:border-brand-brick"
      } ${className}`}
      onClick={() => onClick?.(peerId)}
    >
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted={isLocal || isDeafened}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
        {displayName}
      </div>
    </div>
  );
};

interface VoiceViewProps {
  onLeave?: () => void;
}

export const VoiceView: React.FC<VoiceViewProps> = ({ onLeave }) => {
  const { t } = useTranslation();
  const { localStream, remoteStreams, leaveRoom } = useCall();

  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(false);
  const [deafened, setDeafened] = useState(false);

  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);

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

  const renderControls = () => (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3 rounded-lg border border-brand-brick/70 bg-brand-beige/90 px-3 py-2 text-brand-green font-semibold shadow-sm transition-colors hover:bg-brand-peach hover:border-brand-green">
        <button
          onClick={toggleMic}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            micEnabled
              ? "hover:bg-brand-green text-white bg-brand-green/20"
              : "hover:bg-brand-brick text-white bg-brand-brick"
          }`}
          aria-label={micEnabled ? t("voice.mute") : t("voice.unmute")}
        >
          {micEnabled ? <IconMicOn /> : <IconMicOff />}
        </button>

        <button
          onClick={toggleAudio}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            !deafened
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
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            camEnabled
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
        <VideoTile
          peerId={peerId}
          stream={stream}
          displayName={
            peerId === "local"
              ? t("voice.you")
              : t("voice.user", { id: peerId.slice(0, 4) })
          }
          isLocal={peerId === "local"}
          isDeafened={deafened}
          onClick={handleTileClick}
        />
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
          <VideoTile
            peerId={selectedPeerId!}
            stream={mainStream}
            displayName={
              selectedPeerId === "local"
                ? t("voice.you")
                : t("voice.user", { id: selectedPeerId!.slice(0, 4) })
            }
            isLocal={selectedPeerId === "local"}
            isDeafened={deafened}
            isSelected
            onClick={resetSelection}
            className="w-full h-full"
          />
        </div>
        {otherTiles.length > 0 && (
          <div className="h-24 sm:h-28 md:h-32 flex-shrink-0 w-full overflow-x-auto">
            <div className="flex gap-2 h-full w-max flex-nowrap">
              {otherTiles.map(([peerId, stream]) => (
                <div
                  key={peerId}
                  className="h-full w-32 sm:w-36 md:w-40 flex-shrink-0"
                >
                  <VideoTile
                    peerId={peerId}
                    stream={stream}
                    displayName={
                      peerId === "local"
                        ? t("voice.you")
                        : t("voice.user", { id: peerId.slice(0, 4) })
                    }
                    isLocal={peerId === "local"}
                    isDeafened={deafened}
                    onClick={handleTileClick}
                    className="w-full h-full"
                  />
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
