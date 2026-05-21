import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { X, Coffee, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { User, useAuth } from "../contexts/AuthContext";
import { StatusColors } from "./ProfileButton";
import { Button } from "./Button";
import BackButton from "./BackButton";
import { ProfileEditForm } from "./ProfileEditForm";
import {
  LanguageEditForm,
  LanguageOption,
  normalizeLanguageOption,
} from "./LanguageEditForm";
import SettingsButton from "./SettingsButton";
import api from "../utils/api";

interface ProfilePopupProps {
  user: User;
  friendshipStatus?: "friend" | "pending" | "blocked";
  canAcceptPending?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (
  dateString: string,
  locale: string,
  fallbackText: string,
) => {
  if (!dateString) {
    return fallbackText;
  }
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

export const ProfilePopup: React.FC<ProfilePopupProps> = ({
  user,
  friendshipStatus,
  canAcceptPending,
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<
    "profile" | "language" | null
  >(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });
  const [mobileSettingsView, setMobileSettingsView] = useState<
    "menu" | "profile" | "language"
  >("menu");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(
    normalizeLanguageOption(localStorage.getItem("preferredLanguage")),
  );
  const [friendState, setFriendState] = useState<
    "friend" | "pending" | "not_friend"
  >("not_friend");
  const { logout, setUser, user: authenticatedUser } = useAuth();
  const isOwnProfile = authenticatedUser?.id === user.id;
  const canExpand = isOwnProfile;
  //const isExpandedView = true;
  const showSettingsPanel = canExpand && isExpanded;
  const isEditingProfile =
    isOwnProfile && showSettingsPanel && activeSettingsSection === "profile";
  const isEditingLanguage =
    isOwnProfile && showSettingsPanel && activeSettingsSection === "language";
  const isEditingSettings = isEditingProfile || isEditingLanguage;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  useEffect(() => {
    if (friendshipStatus === "friend") {
      setFriendState("friend");
      return;
    }
    if (friendshipStatus === "pending") {
      setFriendState("pending");
      return;
    }
    setFriendState("not_friend");
  }, [friendshipStatus, user.id]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsExpanded(false);
    setActiveSettingsSection(null);
    setMobileSettingsView("menu");
    setSaveError("");
    onClose();
  };

  const toggleSettings = () => {
    if (isMobile) {
      setIsExpanded(true);
      setMobileSettingsView("menu");
      setActiveSettingsSection(null);
    } else {
      setIsExpanded(!isExpanded);
      setActiveSettingsSection(!isExpanded ? "profile" : null);
    }
    setSaveError("");
  };

  const openMobileProfile = () => {
    setActiveSettingsSection("profile");
    setMobileSettingsView("profile");
    setSaveError("");
  };

  const openMobileLanguage = () => {
    setActiveSettingsSection("language");
    setMobileSettingsView("language");
    setSaveError("");
  };

  const goBackToMobileMenu = () => {
    setActiveSettingsSection(null);
    setMobileSettingsView("menu");
    setSaveError("");
  };
  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleFriendAction = async () => {
    try {
      if (friendState === "pending" && canAcceptPending) {
        await api.put(`/friends/${user.id}`);
        setFriendState("friend");
        return;
      }

      if (friendState === "not_friend") {
        await api.post(`/friends/${user.id}`);
        setFriendState("pending");
        return;
      }

      if (friendState === "friend") {
        await api.delete(`/friends/${user.id}`);
        setFriendState("not_friend");
      }
    } catch (error) {
      console.error("failed to update friendship state", error);
    }
  };

  const friendActionText =
    friendState === "friend"
      ? t("profile.friend.delete")
      : friendState === "pending"
        ? canAcceptPending
          ? t("profile.friend.add")
          : t("profile.friend.requestSent")
        : t("profile.friend.add");

  const isFriendActionDisabled = friendState === "pending" && !canAcceptPending;

  const handleSaveProfile = async (values: {
    username: string;
    displayName: string;
    about: string;
    picture: string;
  }) => {
    setIsSavingProfile(true);
    setSaveError("");

    try {
      const response = await api.put("/users/me", values);
      const updatedProfile = response.data;
      const updatedUser: User = {
        id: updatedProfile.id || user.id,
        name:
          updatedProfile.displayName || updatedProfile.username || user.name,
        username: updatedProfile.username || user.username,
        email: updatedProfile.email || authenticatedUser?.email || "",
        picture: updatedProfile.picture || user.picture,
        status: authenticatedUser?.status || "online",
        about: updatedProfile.about || "",
        createdAt: updatedProfile.createdAt || user.createdAt,
        role: (updatedProfile.role || authenticatedUser?.role || "USER") as
          | "USER"
          | "ADMIN",
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsExpanded(false);
      setActiveSettingsSection(null);
    } catch (error: any) {
      setSaveError(error?.response?.data?.error || t("profileEdit.saveError"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUploadPicture = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/users/me/picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const pictureUrl = response?.data?.url;
    if (!pictureUrl || typeof pictureUrl !== "string") {
      throw new Error("Failed to upload picture");
    }

    return pictureUrl;
  };

  if (isMobile && showSettingsPanel) {
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[9999] flex items-stretch justify-stretch font-roboto">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />
        <div className="fixed inset-0 w-full h-[100dvh] bg-brand-beige border-2 border-gray-800 overflow-hidden flex flex-col shadow-sharp">
          {mobileSettingsView === "menu" ? (
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between gap-3 border-b-2 border-gray-800 bg-brand-green/60 p-4 shrink-0">
                <h4 className="font-ananias text-sm font-bold text-gray-800 uppercase">
                  {t("settings.title")}
                </h4>
                <Button
                  onClick={handleClose}
                  color="bg-brand-beige"
                  className="!p-1.5 !min-w-0 border-2 text-gray-800 hover:bg-brand-brick hover:text-brand-beige"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                <SettingsButton
                  onClick={openMobileProfile}
                  text={t("settings.myProfile")}
                />
                <SettingsButton
                  onClick={openMobileLanguage}
                  text={t("settings.language")}
                />
                <Button
                  onClick={handleLogout}
                  className="w-full !px-3 !py-2 text-sm"
                >
                  {t("common.logout")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between gap-3 border-b-2 border-gray-800 bg-brand-green/60 p-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <BackButton onClick={goBackToMobileMenu} />
                  <h4 className="font-ananias text-sm font-bold text-gray-800 uppercase truncate">
                    {mobileSettingsView === "profile"
                      ? t("settings.myProfile")
                      : t("settings.language")}
                  </h4>
                </div>
                <Button
                  onClick={handleClose}
                  color="bg-brand-beige"
                  className="!p-1.5 !min-w-0 border-2 text-gray-800 hover:bg-brand-brick hover:text-brand-beige"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden p-4">
                {mobileSettingsView === "profile" ? (
                  <ProfileEditForm
                    initialValues={{
                      username: user.username || "",
                      displayName: user.name || user.username || "",
                      about: user.about || "",
                      picture: user.picture || "",
                    }}
                    isSaving={isSavingProfile}
                    errorMessage={saveError}
                    onUploadPicture={handleUploadPicture}
                    onSave={handleSaveProfile}
                  />
                ) : (
                  <LanguageEditForm
                    initialLanguage={selectedLanguage}
                    onSaved={(language) => {
                      setSelectedLanguage(language);
                      handleClose();
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>,
      document.body,
    );
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-stretch justify-stretch md:items-center md:justify-center font-roboto">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className={`
          fixed inset-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          w-full h-[100dvh] md:w-[500px] md:h-[550px]
          bg-brand-beige border-2 border-gray-800 rounded-none md:rounded-xl overflow-hidden
          duration-300 ease-out flex flex-col md:flex-row
						${isMobile ? "" : "animate-slide-up"}
						${showSettingsPanel ? "md:w-[900px] md:h-[700px] shadow-sharp" : "shadow-sharp"}
        `}
      >
        {showSettingsPanel && (
          <div className="hidden md:flex w-[240px] border-r-2 border-gray-800 bg-brand-green/60 p-5 shrink-0 flex-col">
            <h4 className="font-ananias text-sm font-bold text-gray-800 uppercase">
              {t("settings.title")}
            </h4>
            <SettingsButton
              onClick={() => setActiveSettingsSection("profile")}
              text={t("settings.myProfile")}
            />
            <SettingsButton
              onClick={() => setActiveSettingsSection("language")}
              text={t("settings.language")}
            />

            <Button
              onClick={handleLogout}
              className="mt-auto mb-3 w-full !px-3 !py-2 text-sm"
            >
              {t("common.logout")}
            </Button>
          </div>
        )}

        <div className="flex flex-col h-full min-h-0 flex-1 min-w-0">
          {showSettingsPanel && (
            <div className="md:hidden border-b-2 border-gray-800 bg-brand-green/60 p-4 shrink-0 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-ananias text-sm font-bold text-gray-800 uppercase">
                  {t("settings.title")}
                </h4>
                <Button
                  onClick={handleClose}
                  color="bg-brand-beige"
                  className="!p-1.5 !min-w-0 border-2 text-gray-800 hover:bg-brand-brick hover:text-brand-beige"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <SettingsButton
                  onClick={() => setActiveSettingsSection("profile")}
                  text={t("settings.myProfile")}
                />
                <SettingsButton
                  onClick={() => setActiveSettingsSection("language")}
                  text={t("settings.language")}
                />
              </div>
              <Button
                onClick={handleLogout}
                className="w-full !px-3 !py-2 text-sm"
              >
                {t("common.logout")}
              </Button>
            </div>
          )}
          {!isEditingSettings && (
            <>
              <div className="w-full bg-brand-brick relative transition-all duration-300 shrink-0 h-[110px] md:h-[140px]">
                <div className="absolute top-2 right-3 flex gap-2">
                  <Button
                    onClick={handleClose}
                    color="bg-brand-beige"
                    className="!p-1.5 !min-w-0 border-2 text-gray-800 hover:bg-brand-brick hover:text-brand-beige"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="relative px-4 md:px-6 shrink-0">
                <div className="absolute border-4 border-brand-beige bg-gray-300 rounded-full transition-all duration-300 shadow-sm group -top-12 md:-top-16 w-[88px] h-[88px] md:w-[120px] md:h-[120px]">
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                  <div
                    className={`
                  absolute -bottom-0.5 -right-0.5 rounded-full border-[3px] border-brand-beige
                  ${StatusColors[user.status as keyof typeof StatusColors] || "bg-gray-400"}
                  w-8 h-8 -bottom-0.5 -right-0.5
                `}
                  />
                </div>
                {user.role === "ADMIN" && (
                  <div className="absolute flex items-center gap-1 px-2 py-0.5 bg-brand-green text-white rounded-md text-xs font-ananias border border-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,1)] top-3 right-4 md:top-4 md:right-6">
                    <Shield className="w-3 h-3" />
                    {t("common.admin")}
                  </div>
                )}
              </div>
            </>
          )}
          <div
            className={`relative px-4 md:px-6 pb-4 md:pb-6 flex flex-col h-full min-h-0 text-left overflow-y-auto ${isEditingSettings ? "pt-14 md:pt-16" : "pt-16 md:pt-20"}`}
          >
            {isEditingSettings && (
              <div className="hidden md:flex absolute top-4 right-4 z-10 gap-2">
                <Button
                  onClick={handleClose}
                  color="bg-brand-beige"
                  className="!p-1.5 !min-w-0 border-2 text-gray-800 hover:bg-brand-brick hover:text-brand-beige"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            {!isEditingSettings && (
              <>
                <div className="mb-4 shrink-0">
                  <h3
                    className={`
              font-ananias font-bold text-gray-800 leading-none
              text-2xl md:text-3xl
            `}
                  >
                    {user.name}
                  </h3>
                  <p className="text-sm font-roboto text-gray-500 mt-1">
                    {user.name.toLowerCase().replace(/\s/g, "")}
                  </p>
                </div>

                <div className="h-px bg-gray-800/20 mb-4 shrink-0" />
              </>
            )}
            {isOwnProfile &&
            showSettingsPanel &&
            activeSettingsSection === "profile" ? (
              <ProfileEditForm
                initialValues={{
                  username: user.username || "",
                  displayName: user.name || user.username || "",
                  about: user.about || "",
                  picture: user.picture || "",
                }}
                isSaving={isSavingProfile}
                errorMessage={saveError}
                onUploadPicture={handleUploadPicture}
                onSave={handleSaveProfile}
              />
            ) : isOwnProfile &&
              showSettingsPanel &&
              activeSettingsSection === "language" ? (
              <LanguageEditForm
                initialLanguage={selectedLanguage}
                onSaved={(language) => {
                  setSelectedLanguage(language);
                  setIsExpanded(false);
                  setActiveSettingsSection(null);
                }}
              />
            ) : (
              <>
                <div className="mb-4 shrink-0">
                  <h4 className="font-ananias text-sm font-bold text-gray-500 mb-2 flex items-center gap-1 uppercase">
                    <Coffee className="w-4 h-4" />
                    {t("profile.aboutMe")}
                  </h4>
                  <p className="text-sm text-gray-800 font-roboto">
                    {user.about || t("profile.defaultBio")}
                  </p>
                </div>
                <div className="animate-fade-in flex flex-col h-full">
                  <div className="mb-auto">
                    <h4 className="font-ananias text-sm font-bold text-gray-500 mb-2 uppercase">
                      {t("profile.memberSince")}
                    </h4>
                    <p className="text-sm font-mono text-gray-800">
                      {formatDate(
                        user.createdAt,
                        i18n.resolvedLanguage || "en",
                        t("common.unknown"),
                      )}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <Button
                      onClick={toggleSettings}
                      className="mt-5 w-full !px-4 !py-2 text-sm"
                    >
                      {t("profile.editProfile")}
                    </Button>
                  )}
                  {!isOwnProfile && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full">
                      <Button
                        text={friendActionText}
                        onClick={handleFriendAction}
                        disabled={isFriendActionDisabled}
                        color="bg-transparent"
                        className="w-full min-w-0 !px-3 !py-2 text-gray-800 text-sm"
                      />
                      <Button
                        text={t("common.message")}
                        onClick={() => console.log("Message clicked")}
                        className="w-full min-w-0 !px-3 !py-2 text-sm"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ProfilePopup;
