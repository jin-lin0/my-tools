import React from "react";
import "./BackButton.css";

type BackButtonProps = {
  onBack: () => void;
  label?: string | React.ReactNode;
  theme?: "light" | "dark" | "primary";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showIcon?: boolean;
};

export default function BackButton({
  onBack,
  label = "",
  theme = "light",
  position = "top-left",
  showIcon = true,
}: BackButtonProps) {
  return (
    <button
      className={`back-button ${theme} ${position}`}
      onClick={onBack}
      aria-label="返回上一页"
    >
      {showIcon && <span className="icon">←</span>}
      {label && <span className="text">{label}</span>}
    </button>
  );
}
