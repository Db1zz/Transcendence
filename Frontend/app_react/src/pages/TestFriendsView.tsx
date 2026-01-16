import React from "react";
import { FriendsView } from "../components/FriendsView";

const TestFriendsView = () => {
  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden font-roboto">
      <div className="w-[72px] h-full bg-white border-r border-gray-200 flex items-center justify-center text-gray-400 font-mono text-xs shrink-0">
        div
      </div>
      <div className="w-[240px] h-full bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="flex-1 flex items-center justify-center text-gray-400 font-mono text-xs">
          div
        </div>
        <div className="h-[52px] border-t border-gray-200 flex items-center justify-center text-gray-400 font-mono text-xs bg-white">
          div
        </div>
      </div>

      <main className="flex-1 h-full min-w-0 relative bg-brand-beige">
        <FriendsView />
      </main>
    </div>
  );
};

export default TestFriendsView;
