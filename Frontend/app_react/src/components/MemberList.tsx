import React from "react";
import ProfileButton from "./ProfileButton";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const groups = members.reduce<Record<string, Member[]>>((acc, m) => {
    const key = m.status === "offline" ? "offline" : m.role || "online";
    (acc[key] ||= []).push(m);
    return acc;
  }, {});

  const orderedKeys = Object.keys(groups).sort((a, b) => {
    if (a === "offline") return 1;
    if (b === "offline") return -1;
    return a.localeCompare(b);
  });

  const getGroupDisplayName = (groupKey: string) => {
    if (groupKey === "offline") return t("memberList.offline", "Offline");
    if (groupKey === "online") return t("memberList.online", "Online");
    return groupKey; 
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-5 px-1 mt-2">
      {orderedKeys.map((group) => (
        <div key={group}>
          <h3 className="mb-2 px-2 text-xs font-ananias font-bold uppercase tracking-wider text-brand-beige/70">
            {getGroupDisplayName(group)} — {groups[group].length}
          </h3>
          <div className="space-y-1">
            {groups[group].map((m) => (
              <ProfileButton
                key={m.id}
                user={
                  {
                    id: m.id,
                    name: m.name,
                    username: m.name,
                    displayName: m.name,
                    picture: m.avatarUrl,
                    status: m.status,
                  } as any
                }
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