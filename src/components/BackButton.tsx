import "./BackButton.css";

type BackButtonProps = {
  onBack: () => void;
  label?: string;
};

export default function BackButton({ onBack, label = "←" }: BackButtonProps) {
  return (
    <button className="back-button" onClick={onBack}>
      {label}
    </button>
  );
}
