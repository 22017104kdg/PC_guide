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
import TwoDPage from "./pages/TwoDOptionPage";
import TwoDOptionPage from "./pages/TwoDOptionPage";      // ← 여기에 맞춰 파일 생성
import TwoDOptionResult from "./pages/TwoDOptionResult";  // ← 여기에 맞춰 파일 생성
import ThreeDPage from "./pages/ThreeDPage";
import AiPage from "./pages/AiPage";
import GameSimplePage from "./pages/GameSimplePage";
import GameAdvancedPage from "./pages/GameAdvancedPage";
import GameRecommendResult from "./pages/GameRecommendResult";
import GameOptionSelect from "./pages/GameOptionSelect";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />

        {/* 게임 간단/고급 추천 */}
        <Route path="/game" element={<GamePage />} />
        <Route path="/game/simple" element={<GameSimplePage />} />
        <Route path="/game/simple/result" element={<GameRecommendResult />} />
        <Route path="/game/advanced" element={<GameAdvancedPage />} />
        <Route path="/game/advanced/result" element={<GameOptionSelect />} />

        {/* 2D 그래픽 작업 */}
        <Route path="/2d" element={<TwoDPage />} />
        <Route path="/2d/options" element={<TwoDOptionPage />} />
        <Route path="/2d/options/result" element={<TwoDOptionResult />} />

        {/* 그 외 */}
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
