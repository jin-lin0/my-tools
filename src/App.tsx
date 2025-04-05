import "./App.css";
import MainMenu from "./MainMenu";
import AIChatApp from "./AIChatApp";
import PhysicsSandbox from "./PhysicsSandbox";
import WebNavigation from "./WebNavigation";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const navigate = useNavigate();

  const handleAppSelect = (appId: string) => {
    navigate(`/${appId}`);
  };

  const handleBackToMenu = () => {
    navigate("/");
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<MainMenu onAppSelect={handleAppSelect} />} />
        <Route
          path="/ai-chat"
          element={<AIChatApp onBack={handleBackToMenu} />}
        />
        <Route
          path="/physics-sandbox"
          element={<PhysicsSandbox onBack={handleBackToMenu} />}
        />
        <Route
          path="/web-navigation"
          element={<WebNavigation onBack={handleBackToMenu} />}
        />
      </Routes>
    </div>
  );
}

export default App;
