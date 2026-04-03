import React, { useEffect, useState } from "react";
import { Button } from "./Button";

export type LanguageOption = "english" | "русский" | "deutsch";

interface LanguageEditFormProps {
  initialLanguage: LanguageOption;
  onSaved?: (language: LanguageOption) => void;
}

const selectClassName =
  "w-full rounded-lg border-2 border-gray-800 bg-brand-green px-3 py-2 font-roboto text-sm text-gray-800 outline-none focus:ring-2 focus:ring-brand-brick";

export const LanguageEditForm = ({
  initialLanguage,
  onSaved,
}: LanguageEditFormProps) => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageOption>(initialLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setSelectedLanguage(initialLanguage);
  }, [initialLanguage]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      localStorage.setItem("preferredLanguage", selectedLanguage);
      onSaved?.(selectedLanguage);
    } catch (_error: any) {
      setErrorMessage("Failed to save language");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      onSubmit={handleSubmit}
    >
      <div>
        <h4 className="mb-2 font-ananias text-sm font-bold uppercase text-gray-500">
          language
        </h4>
        <label className="mb-1 block font-ananias text-xs font-bold uppercase text-gray-500">
          select language
        </label>
        <select
          className={selectClassName}
          value={selectedLanguage}
          onChange={(event) =>
            setSelectedLanguage(event.target.value as LanguageOption)
          }
        >
          <option value="english">english</option>
          <option value="русский">русский</option>
          <option value="deutsch">deutsch</option>
        </select>
      </div>

      {errorMessage && (
        <p className="rounded-lg border-2 border-red-500 bg-red-100 px-3 py-2 font-roboto text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSaving}
        className="mt-auto mb-2 w-full !px-3 !py-2 text-sm"
      >
        {isSaving ? "saving..." : "save"}
      </Button>
    </form>
  );
};

export default LanguageEditForm;
