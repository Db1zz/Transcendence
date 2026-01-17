import React from "react";

interface ButtonProps {
  text?: string;
  color?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  color = "bg-brand-brick",
  onClick,
  className = "",
  children,
}) => {
  return (
    <button
      onClick={onClick}
      className={`border border-gray-800 px-11 py-3 rounded-lg font-medium transition-all duration-150 shadow-sharp-button font-ananias text-brand-beige hover:shadow-none hover:translate-x-[5px] hover:translate-y-[6px] flex items-center justify-center gap-2 ${color} ${className}`}
    >
      {text || children}
    </button>
  );
};
