import React, { useRef } from "react";
import "./WebNavigation.css";
import websitesData from "./WebNavigation.json";
import BackButton from "./components/BackButton";

interface Website {
  id: string | number;
  name: string;
  url: string;
  description: string;
  category: string;
  icon: string;
}

interface WebNavigationProps {
  onBack: () => void;
}

const WebNavigation: React.FC<WebNavigationProps> = ({ onBack }) => {
  // 添加返回按钮
  const [isNavVisible, setIsNavVisible] = React.useState(() => {
    const saved = localStorage.getItem("webNavCollapsed");
    return saved ? saved === "false" : true;
  });
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const websites: Website[] = websitesData;

  const categories = [...new Set(websites.map((site) => site.category))];

  const scrollToCategory = (category: string) => {
    categoryRefs.current[category]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="web-navigation-container">
      <BackButton position="top-right" onBack={onBack} />
      <div className={`category-nav ${isNavVisible ? "" : "collapsed"}`}>
        <button
          key={`nav-toggle`}
          className="category-nav-item nav-toggle-button"
          onClick={() => {
            const newValue = !isNavVisible;
            setIsNavVisible(newValue);
            localStorage.setItem("webNavCollapsed", String(isNavVisible));
          }}
        >
          {isNavVisible ? "←" : "☰"}
        </button>
        {categories.map((category) => (
          <button
            key={`nav-${category}`}
            onClick={() => scrollToCategory(category)}
            className="category-nav-item"
          >
            {category}
          </button>
        ))}
      </div>
      <div
        className={`web-navigation ${
          isNavVisible ? "web-navigation-expanded" : "web-navigation-collapsed"
        }`}
      >
        <h1>网站导航</h1>
        {categories.map((category) => (
          <div
            key={category}
            className="category-section"
            ref={(el: HTMLDivElement | null) => {
              if (el) {
                categoryRefs.current[category] = el;
              }
            }}
          >
            <h2>{category}</h2>
            <div className="websites-grid">
              {websites
                .filter((site) => site.category === category)
                .map((site) => (
                  <a
                    key={site.id}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="website-card"
                  >
                    <div className="website-icon">{site.icon}</div>
                    <div className="website-info">
                      <h3>{site.name}</h3>
                      <p>{site.description}</p>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebNavigation;
