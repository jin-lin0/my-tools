// dropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import "./DrapDown.css";

interface DropdownProps {
  options: string[];
  placeholder?: string;
  onChange?: (selectedOption: string) => void;
  defaultValue?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  placeholder = "请选择",
  defaultValue,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(
    defaultValue || null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option);
    }
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <div
        className={`dropdown-header ${isOpen ? "active" : ""}`}
        onClick={toggleDropdown}
      >
        <span className="dropdown-selected">
          {selectedOption || placeholder}
        </span>
        <span className={`dropdown-arrow ${isOpen ? "up" : "down"}`}></span>
      </div>

      <div className={`dropdown-options ${isOpen ? "open" : ""}`}>
        {options.map((option, index) => (
          <div
            key={index}
            className={`dropdown-option ${
              selectedOption === option ? "selected" : ""
            }`}
            onClick={() => handleOptionClick(option)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
