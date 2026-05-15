import React, { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";

interface CreateServerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export const CreateServerPopup: React.FC<CreateServerPopupProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const { t } = useTranslation();
  const [serverName, setServerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreate(serverName);
      setServerName("");
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
          <h2 className="text-xl font-bold text-brand-green">
            {t("server.create.title")}
          </h2>
          <button
            onClick={onClose}
            className="text-brand-green hover:text-brand-brick"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            {t("server.create.description")}
          </p>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            {t("server.create.nameLabel")}
          </label>
          <input
            type="text"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            className="w-full p-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green mb-6 text-gray-800"
            placeholder={t("server.create.namePlaceholder") as string}
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              color="bg-transparent"
              className="!text-gray-600 !border-transparent hover:underline !shadow-none !px-4"
            >
              {t("server.create.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!serverName.trim() || isSubmitting}
              color="bg-brand-green"
              className="!text-brand-beige hover:bg-brand-brick !px-6"
            >
              {t("server.create.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
