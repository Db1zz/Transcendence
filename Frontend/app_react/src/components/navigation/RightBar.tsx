import React from "react";
import { useTranslation } from "react-i18next";
import bgSideBar from "../../img/bg_sidebar.png";

interface RightBarProps {
  children?: React.ReactNode;
}

export const RightBar: React.FC<RightBarProps> = ({ children }) => {
  const { t } = useTranslation();
  return (
    <div className="h-full rounded-r-lg p-4 border-brand-green relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgSideBar})` }}
      />
      <div className="absolute inset-0 bg-brand-green opacity-90" />
      <div className="relative z-10 text-gray-800 font-semibold mb-4">
        {children ? (
          children
        ) : (
          <div className="text-gray-800 font-semibold mb-4">
            {t("rightBar.placeholder")}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightBar;
