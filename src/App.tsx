import "./App.css";
import MainMenu from "./MainMenu";
import AIChatApp from "./AIChatApp";
import { useState } from "react";

function App() {
  const [currentView, setCurrentView] = useState<string>("main");

  const handleAppSelect = (appId: string) => {
    if (appId === "ai-chat") {
      setCurrentView("ai-chat");
    }
  };

  const handleBackToMenu = () => {
    setCurrentView("main");
  };

  return (
    <div className="app">
      {currentView === "main" ? (
        <MainMenu onAppSelect={handleAppSelect} />
      ) : (
        <AIChatApp onBack={handleBackToMenu} />
      )}
    </div>
  );
}

export default App;
