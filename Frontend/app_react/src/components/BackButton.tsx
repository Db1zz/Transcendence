import React from "react";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  className = "",
  label = "Go back",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-green/30 bg-brand-beige text-brand-green shadow-sm ${className}`}
      aria-label={label}
    >
      <ArrowLeft size={18} />
    </button>
  );
};

export default BackButton;
