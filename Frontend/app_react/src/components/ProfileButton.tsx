import React, { useState } from "react"
import { ProfilePopup } from "./ProfilePopup"

interface ProfileButtonProps {
    user: any;                      // any for the testing, when parsing from back works change to User
    className?: string;
};

export const StatusColors = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    dnd: 'bg-red-500',
    offline: 'bg-gray-400',
};

export const ProfileButton: React.FC<ProfileButtonProps> = ({
    user,
    className = ''
}) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsPopupOpen(!isPopupOpen)}
                className={`
                    flex items-center gap-3 px-3 py-2
                    bg-brand-beige border-2 border-gray-800 rounded-lg
                    shadow-sharp-button
                    hover:shadow-none
                    hover:translate-x-[3px] hover:translate-y-[3px]
                    transition-all duration-150
                    ${className}
                `}
            >
                <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-800">
                        <img
                            src={user.picture}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full
                            border-2 border-brand-beige
                            ${StatusColors[user.status as keyof typeof StatusColors] || 'bg-gray-400'}
                        `}
                    />
                </div>
                
                <div className="text-left">
                    <p className="font-ananias font-bold text-gray-800 text-sm">
                        {user.name}
                    </p>
                    <p className="font-roboto text-xs text-brand-brick font-bold uppercase">
                        {user.status || 'offline'}
                    </p>
                </div>
            </button>
            <ProfilePopup
                user={user}
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
            />
        </>
    );
};

export default ProfileButton;