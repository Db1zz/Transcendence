import React from "react";
import bgSideBar from "../../img/bg_sidebar.png";
import { Button } from "../Button";

export const RightBar: React.FC = () => {
  return (
    <div className="h-full rounded-r-lg p-4 border-brand-green relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgSideBar})` }}
      />
      <div className="absolute inset-0 bg-brand-green opacity-90" />
      <div className="relative z-10 text-gray-800 font-semibold mb-4">
        some content
      </div>
    </div>
  );
};

export default RightBar;
