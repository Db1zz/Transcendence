import React from "react";
import bgLSideBar from "../../img/bg_l_sidebar.png";

export const LeftBar: React.FC = () => {
  return (
    <div className="h-full rounded-l-lg p-4 border border-brand-green relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgLSideBar})` }}
      />
      <div className="absolute inset-0 bg-brand-peach opacity-90" />
      <div className="relative z-10 text-gray-800 font-semibold mb-4">
        list of dms
      </div>
    </div>
  );
};

export default LeftBar;
