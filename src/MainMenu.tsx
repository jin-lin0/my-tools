import React from "react";
import "./MainMenu.css";

interface AppItem {
  id: string;
  name: string;
  icon: string;
}

interface MainMenuProps {
  onAppSelect: (appId: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onAppSelect }) => {
  const apps: AppItem[] = [
    { id: "ai-chat", name: "AI聊天助手", icon: "💬" },
    // 可以在这里添加更多应用
  ];

  return (
    <div className="main-menu">
      <h1>我的工具箱</h1>
      <div className="app-grid">
        {apps.map((app) => (
          <div
            key={app.id}
            className="app-card"
            onClick={() => onAppSelect(app.id)}
          >
            <div className="app-icon">{app.icon}</div>
            <div className="app-name">{app.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainMenu;
