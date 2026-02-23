import React, { useState, useRef, useEffect } from "react";
import { useCall } from "../hooks/useCall";
import { useCallContext } from "../contexts/CallContext";

function insertVideoElement(parentId: string, position: InsertPosition): HTMLVideoElement {
  const parent = document.getElementById(parentId);
  if (!parent) {
    throw new Error(`Parent element with id "${parentId}" not found`);
  }

  const video = document.createElement('video');

  video.playsInline = true;
  video.autoplay = true;
  video.className = 'w-[600px] h-[350px] bg-black rounded-lg shadow';

  parent.insertAdjacentElement(position, video);

  return video;
}

export const VoiceView: React.FC = () => {
	const callContext = useCallContext();
	
	useEffect(() => {
		if (!callContext.activeCall || !callContext.activeCall.webRtcSession) {
			throw new Error("TODO");
		}
		insertVideoElement("zxc", 'beforeend');
		console.log("zxc");
	});

	return (
		<div className="flex justify-center items-center">
			<div id="zxc" className="flex gap-6 mx-auto">
			</div>
		</div>
	);
};