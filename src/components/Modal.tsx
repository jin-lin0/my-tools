import React, { ReactNode } from "react";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${className}`}>
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        {title && <h1>{title}</h1>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
