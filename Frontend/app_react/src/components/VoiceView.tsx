import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useCallContext } from "../contexts/CallContext";
import { useWebRtc } from "../hooks/useWebRtc";

const IconMicOn = () => <span>🎤</span>;
const IconMicOff = () => <span>🔇</span>;
const IconCamOn = () => <span>📹</span>;
const IconCamOff = () => <span>🚫</span>;
const IconHeadphones = () => <span>🎧</span>;

interface VideoTileProps {
  peerId: string;
  stream: MediaStream;
  isLocal?: boolean;
  isSelected?: boolean;
  onClick?: (peerId: string) => void;
  className?: string;
}

const VideoTile: React.FC<VideoTileProps> = ({
  peerId,
  stream,
  isLocal,
  isSelected,
  onClick,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const displayName = isLocal ? "You" : `User ${peerId.slice(0, 4)}`;

  return (
    <div
      className={`relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-500"
          : "border-transparent hover:border-indigo-500"
      } ${className}`}
      onClick={() => onClick?.(peerId)}
    >
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted={isLocal}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
        {displayName}
      </div>
    </div>
  );
};

export const VoiceView: React.FC = () => {
  const callContext = useCallContext();
  const { remoteStreams, localStream } = useWebRtc(
    callContext.activeCall?.roomId!,
    callContext.activeCall?.signalingServerAddress!,
    callContext.activeCall?.stunAddress!,
  );

  const audioEnabled = false;
  const videoEnabled = false;

  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);

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

  const resetSelection = useCallback(() => setSelectedPeerId(null), []);

  const renderControls = () => (
    <div className="flex gap-3 bg-black/80 backdrop-blur-sm rounded-full p-2 shadow-xl">
      <button
        // onClick={toggleAudio}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          audioEnabled
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
        aria-label={audioEnabled ? "Mute microphone" : "Unmute microphone"}
      >
        {audioEnabled ? <IconMicOn /> : <IconMicOff />}
      </button>
      <button
        // onClick={toggleVideo}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          videoEnabled
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
        aria-label={videoEnabled ? "Turn off camera" : "Turn on camera"}
      >
        {videoEnabled ? <IconCamOn /> : <IconCamOff />}
      </button>
      <button
        className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
        aria-label="Headphones"
      >
        <IconHeadphones />
      </button>
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
          isLocal={peerId === "local"}
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
            isLocal={selectedPeerId === "local"}
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
                    isLocal={peerId === "local"}
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
    <div className="flex flex-col w-full h-full min-h-[80vh] bg-[#313338] p-4">
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
