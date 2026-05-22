import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface CreateChannelModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  placeholder?: string;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  title,
  description,
  placeholder = "Channel name",
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreate(trimmedName);
      onClose();
    } catch (error) {
      console.error("Failed to create channel:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg border-2 border-brand-green bg-brand-beige shadow-xl">
        <div className="flex items-center justify-between border-b border-brand-green bg-brand-peach p-4">
          <div>
            <h3 className="text-lg font-bold text-brand-green">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-green hover:text-brand-brick"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
            Channel Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={placeholder}
            autoFocus
            className="mb-6 w-full rounded border border-gray-300 bg-white p-3 text-gray-800 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              color="bg-transparent"
              className="!border-transparent !px-4 !text-gray-600 !shadow-none hover:underline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              color="bg-brand-green"
              className="!px-6 !text-brand-beige hover:bg-brand-brick"
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
