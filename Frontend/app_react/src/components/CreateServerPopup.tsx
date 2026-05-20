import React, { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";

interface CreateServerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  onJoin: (code: string) => Promise<void>;
}

export const CreateServerPopup: React.FC<CreateServerPopupProps> = ({
  isOpen,
  onClose,
  onCreate,
  onJoin,
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (mode === "create") {
        await onCreate(inputValue);
      } else {
        await onJoin(inputValue);
      }
      setInputValue("");
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-brand-beige rounded-lg shadow-xl w-full max-w-md overflow-hidden border-2 border-brand-green">
        <div className="flex justify-between items-center p-4 border-b border-brand-green bg-brand-peach">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setMode("create");
                setInputValue("");
              }}
              className={`text-lg font-bold ${mode === "create" ? "text-brand-green underline" : "text-gray-500"}`}
            >
              Create
            </button>
            <button
              onClick={() => {
                setMode("join");
                setInputValue("");
              }}
              className={`text-lg font-bold ${mode === "join" ? "text-brand-green underline" : "text-gray-500"}`}
            >
              Join
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-brand-green hover:text-brand-brick"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            {mode === "create"
              ? t(
                  "server.create.description",
                  "Give your server a name. You can always change it later.",
                )
              : "Enter an invite code to join an existing server."}
          </p>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            {mode === "create"
              ? t("server.create.nameLabel", "Server Name")
              : "Invite Code"}
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green mb-6 text-gray-800"
            placeholder={
              mode === "create"
                ? (t("server.create.namePlaceholder", "My Server") as string)
                : "e.g. X7B9Q2"
            }
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              color="bg-transparent"
              className="!text-gray-600 !border-transparent hover:underline !shadow-none !px-4"
            >
              {t("server.create.cancel", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!inputValue.trim() || isSubmitting}
              color="bg-brand-green"
              className="!text-brand-beige hover:bg-brand-brick !px-6"
            >
              {mode === "create"
                ? t("server.create.submit", "Create")
                : "Join Server"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
