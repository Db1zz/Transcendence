import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";

export interface ProfileEditValues {
  username: string;
  displayName: string;
  about: string;
  picture: string;
}

interface ProfileEditFormProps {
  initialValues: ProfileEditValues;
  isSaving: boolean;
  errorMessage?: string;
  onUploadPicture: (file: File) => Promise<string>;
  onSave: (values: ProfileEditValues) => Promise<void> | void;
}

const inputClassName =
  "w-full rounded-lg border-2 border-gray-800 bg-brand-green px-3 py-2 font-roboto text-sm text-gray-800 outline-none focus:ring-2 focus:ring-brand-brick";

export const ProfileEditForm = ({
  initialValues,
  isSaving,
  errorMessage,
  onUploadPicture,
  onSave,
}: ProfileEditFormProps) => {
  const { t } = useTranslation();
  const [values, setValues] = useState<ProfileEditValues>(initialValues);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave(values);
  };

  const handlePictureChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setUploadError("");
    setIsUploadingPicture(true);
    try {
      const pictureUrl = await onUploadPicture(file);
      setValues((current: ProfileEditValues) => ({
        ...current,
        picture: pictureUrl,
      }));
    } catch (error: any) {
      setUploadError(
        error?.response?.data?.error || t("profileEdit.uploadError"),
      );
    } finally {
      setIsUploadingPicture(false);
    }
  };

  return (
    <form
      className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      onSubmit={handleSubmit}
    >
      <div>
        <div className="flex items-center gap-4 rounded-lg border-2 border-gray-800 bg-brand-beige p-3">
          <img
            src={values.picture}
            alt="Profile"
            className="h-16 w-16 rounded-full border-2 border-gray-800 object-cover"
          />
          <div className="flex-1">
            <input
              id="profile-picture-upload"
              type="file"
              accept="image/*"
              onChange={handlePictureChange}
              className="hidden"
            />
            <label
              htmlFor="profile-picture-upload"
              className="mb-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-gray-800 bg-brand-green px-3 py-2 font-ananias text-sm uppercase text-gray-800 transition-colors hover:bg-brand-green/80"
            >
              <Pencil className="h-4 w-4" />
              {isUploadingPicture
                ? t("profileEdit.uploading")
                : t("profileEdit.uploadFromComputer")}
            </label>
            <p className="font-roboto text-xs text-gray-500">
              {t("profileEdit.pictureHint")}
            </p>
          </div>
        </div>
      </div>

      {uploadError && (
        <p className="rounded-lg border-2 border-red-500 bg-red-100 px-3 py-2 font-roboto text-sm text-red-700">
          {uploadError}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-ananias text-xs font-bold uppercase text-gray-500">
            {t("profileEdit.username")}
          </label>
          <input
            className={inputClassName}
            value={values.username}
            onChange={(event) =>
              setValues((current: ProfileEditValues) => ({
                ...current,
                username: event.target.value,
              }))
            }
            placeholder={t("profileEdit.usernamePlaceholder")}
          />
        </div>
        <div>
          <label className="mb-1 block font-ananias text-xs font-bold uppercase text-gray-500">
            {t("profileEdit.displayableName")}
          </label>
          <input
            className={inputClassName}
            value={values.displayName}
            onChange={(event) =>
              setValues((current: ProfileEditValues) => ({
                ...current,
                displayName: event.target.value,
              }))
            }
            placeholder={t("profileEdit.displayableNamePlaceholder")}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-ananias text-xs font-bold uppercase text-gray-500">
          {t("profileEdit.aboutMe")}
        </label>
        <textarea
          className={`${inputClassName} min-h-[120px] resize-none`}
          value={values.about}
          onChange={(event) =>
            setValues((current: ProfileEditValues) => ({
              ...current,
              about: event.target.value,
            }))
          }
          placeholder={t("profileEdit.aboutPlaceholder")}
        />
      </div>

      {errorMessage && (
        <p className="rounded-lg border-2 border-red-500 bg-red-100 px-3 py-2 font-roboto text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSaving || isUploadingPicture}
        className="mt-auto mb-2 w-full !px-3 !py-2 text-sm"
      >
        {isSaving ? t("common.saving") : t("common.save")}
      </Button>
    </form>
  );
};

export default ProfileEditForm;
