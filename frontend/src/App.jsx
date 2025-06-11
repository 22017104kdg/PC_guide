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
import TwoDOptionPage from "./pages/TwoDOptionPage";
import TwoDOptionResult from "./pages/TwoDOptionResult";
import ThreeDPage from "./pages/ThreeDPage";
import ThreeDOptionResult from "./pages/ThreeDOptionResult";

import GameSimplePage from "./pages/GameSimplePage";
import GameAdvancedPage from "./pages/GameAdvancedPage";
import GameRecommendResult from "./pages/GameRecommendResult";
import GameOptionSelect from "./pages/GameOptionSelect";

import AiPage from "./pages/AiPage";
import AiResultPage from "./pages/AiResultPage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={true}> {/* ✅ 변경됨 */}
      <Routes location={location} key={location.pathname}>
        {/* 홈 */}
        <Route path="/" element={<Home />} />

        {/* 게임 */}
        <Route path="/game" element={<GamePage />} />
        <Route path="/game/simple" element={<GameSimplePage />} />
        <Route path="/game/simple/result" element={<GameRecommendResult />} />
        <Route path="/game/advanced" element={<GameAdvancedPage />} />
        <Route path="/game/advanced/result" element={<GameOptionSelect />} />

        {/* 2D 그래픽 작업 */}
        <Route path="/2d" element={<TwoDPage />} />
        <Route path="/2d/options" element={<TwoDOptionPage />} />
        <Route path="/2d/options/result" element={<TwoDOptionResult />} />

        {/* 3D 그래픽 작업 */}
        <Route path="/3d" element={<ThreeDPage />} />
        <Route path="/3d/options/result" element={<ThreeDOptionResult />} />

        {/* AI 작업 */}
        <Route path="/ai" element={<AiPage />} />
        <Route path="/ai/result" element={<AiResultPage />} />

        {/* fallback: 잘못된 경로 → Home */}
        <Route path="*" element={<Home />} /> {/* ✅ 추가됨 */}
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router basename="/PC_guide">
      <TransitionProvider>
        <AnimatedRoutes />
      </TransitionProvider>
    </Router>
  );
}
