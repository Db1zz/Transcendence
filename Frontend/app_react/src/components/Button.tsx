import React from "react";

interface ButtonProps {
	text: string;
	color?: string;
	onClick?: () => void;
	className?: string;
}

export const Button: React.FC<ButtonProps> = ({
	text,
	color = 'bg-brand-brick',
	onClick,
	className = ''
}) => {
	return (
		<button
			onClick={onClick}
			className={`border border-gray-800 px-9 py-3 rounded-lg font-medium transition-all duration-150 shadow-sharp-button font-ananias text-brand-beige hover:shadow-none hover:translate-x-[5px] hover:translate-y-[6px]  ${color} ${className}`}
		>
			{text}
		</button>
	);
};
