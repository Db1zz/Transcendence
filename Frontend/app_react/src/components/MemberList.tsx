import React from "react";
import ProfileButton from "./ProfileButton";

export type MemberStatus = "online" | "idle" | "dnd" | "offline";
export interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  status: MemberStatus;
  role?: string;
}

interface MemberListProps {
  members: Member[];
}

export const MemberList: React.FC<MemberListProps> = ({ members }) => {
  const groups = members.reduce<Record<string, Member[]>>((acc, m) => {
    const key = m.status === "offline" ? "Offline" : m.role || "Online";
    (acc[key] ||= []).push(m);
    return acc;
  }, {});

  const orderedKeys = Object.keys(groups).sort((a, b) => {
    if (a === "Offline") return 1;
    if (b === "Offline") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-5 px-1 mt-2">
      {orderedKeys.map((group) => (
        <div key={group}>
          <h3 className="mb-2 px-2 text-xs font-ananias font-bold uppercase tracking-wider text-gray-800/70">
            {group} — {groups[group].length}
          </h3>
          <div className="space-y-1">
            {groups[group].map((m) => (
              <ProfileButton
                key={m.id}
                user={{
                  ...m,
                  picture:
                    "https://i.pinimg.com/1200x/c4/a4/36/c4a4365f7c98dc3b4b26fbad20da527d.jpg",
                }}
                variant="v2"
                className="w-full !px-2 !py-1.5"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
