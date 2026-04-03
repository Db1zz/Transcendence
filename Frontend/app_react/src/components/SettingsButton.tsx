type SettingsButtonProps = {
  onClick: () => void;
  text: string;
};

export default function SettingsButton({ onClick, text }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mt-3 w-full rounded-lg border-2 border-gray-800 bg-brand-beige px-3 py-2 text-left font-ananias text-sm uppercase text-gray-800 transition-colors hover:bg-brand-beige/70"
    >
      {text}
    </button>
  );
}
