import React, { useState } from "react";
import { LegalModal } from "./LegalModal";

export const Footer: React.FC = () => {
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<"privacy" | "terms">("privacy");

  const openLegal = (tab: "privacy" | "terms") => {
    setLegalTab(tab);
    setLegalOpen(true);
  };

  return (
    <>
      <footer className="w-full border-t border-[#d3c5bd] bg-[#e8deda]/40 py-1 px-2 flex items-center justify-center gap-2 min-h-[22px]">
        <button
          onClick={() => openLegal("privacy")}
          className="text-[9px] font-medium text-gray-400 hover:text-brand-green transition-colors uppercase tracking-tight leading-none"
        >
          Privacy
        </button>

        <span className="text-gray-300 text-[8px] leading-none">•</span>

        <button
          onClick={() => openLegal("terms")}
          className="text-[9px] font-medium text-gray-400 hover:text-brand-green transition-colors uppercase tracking-tight leading-none"
        >
          Terms
        </button>
      </footer>

      <LegalModal
        isOpen={legalOpen}
        onClose={() => setLegalOpen(false)}
        initialTab={legalTab}
      />
    </>
  );
};
export default Footer;