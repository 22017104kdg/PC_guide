import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { TransitionProvider } from "./TransitionContext";
import Home from "./pages/Home";
import GamePage from "./pages/GamePage";
import TwoDPage from "./pages/TwoDPage";
import ThreeDPage from "./pages/ThreeDPage";
import AiPage from "./pages/AiPage";
import GameSimplePage from "./pages/GameSimplePage";
import GameAdvancedPage from "./pages/GameAdvancedPage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/game/simple" element={<GameSimplePage />} />
        <Route path="/game/advanced" element={<GameAdvancedPage />} />
        <Route path="/2d" element={<TwoDPage />} />
        <Route path="/3d" element={<ThreeDPage />} />
        <Route path="/ai" element={<AiPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <TransitionProvider>
        <AnimatedRoutes />
      </TransitionProvider>
    </Router>
  );
}
