import React from "react";

interface ButtonProps {
  text?: string;
  color?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  color = "bg-brand-brick",
  onClick,
  type = "button",
  className = "",
  children,
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`border border-gray-800 px-11 py-3 rounded-lg font-medium transition-all duration-150 shadow-sharp-button font-ananias text-brand-beige hover:shadow-none hover:translate-x-[5px] hover:translate-y-[3px] disabled:opacity-50flex items-center justify-center gap-2 ${color} ${className}`}
    >
      {text || children}
    </button>
  );
};
