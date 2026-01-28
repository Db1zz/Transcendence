"use client";

import React, { useState } from "react";

interface NavigationItemProps {
  id: string;
  imageUrl: string;
  name: string;
  isActive?: boolean;
}

export const NavigationItem = ({
  id,
  imageUrl,
  name,
  isActive = false,
}: NavigationItemProps) => {
  const [active, setActive] = useState(isActive);

  const handleClick = () => {
    setActive(true);
    console.log(`Navigated to server: ${name}`);
  };

  return (
    <button
      onClick={handleClick}
      className="group relative flex items-center"
      title={name}
    >
      <div
        className={`absolute left-0 bg-brand-brick rounded-r-full transition-all w-[4px] border-brand-peach ${
          !active && "group-hover:h-[20px]"
        } ${active ? "h-[36px]" : "h-[8px]"}`}
      />
      <div
        className={`relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all border border-brand-peach overflow-hidden bg-gray-300 flex items-center justify-center text-sm font-bold ${
          active ? "rounded-[16px]" : ""
        }`}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      </div>
    </button>
  );
};
