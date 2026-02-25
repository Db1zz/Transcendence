export type RtcSignal = 
| { type: "offer"; from: string, to: string, sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string, to: string, sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string, to: string, candidate: RTCIceCandidateInit }
  | { type: "new-connection"; from: string }
  | { type: "user-disconnection"; from: string};

  /*
    A new-connection[from: A] -> B offer[to: A] -> server[B offer[from: B, to: A]] -> A answer[to: B] -> server[A answer[from: A, to: B]] -> B ok.
  */