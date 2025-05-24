import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackIcon from "../assets/iconIMG/previous.png";
import StickIcon from "../assets/iconIMG/stick.png"; // ✅ 아이콘 추가

export default function GameOptionPage() {
  const navigate = useNavigate();
  const [gameName, setGameName] = useState("");
  const [resolution, setResolution] = useState("");
  const [quality, setQuality] = useState("");
  const [fps, setFps] = useState("");

  return (
    <motion.div
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="h-screen bg-black text-white p-6 relative"
    >
      {/* 🔙 뒤로가기 버튼 */}
      <button
        onClick={() => navigate("/game")}
        className="absolute top-[1.25rem] left-4 p-2 hover:opacity-80 transition"
      >
        <img src={BackIcon} alt="뒤로가기" className="w-6 h-6 invert" />
      </button>

      {/* 제목 + 아이콘 */}
      <h2 className="text-2xl font-bold mb-8 text-left ml-12 flex items-center">
        <img src={StickIcon} alt="옵션 아이콘" className="w-6 h-6 mr-2" />
        게임 옵션 선택
      </h2>

      {/* 옵션 입력 UI 카드 */}
      <div className="bg-gray-900 rounded-xl p-6 space-y-6">
        {/* 게임명 */}
        <div>
          <label className="block mb-2 font-medium">게임명</label>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="w-full p-2 rounded text-black"
            placeholder="예: Apex Legends"
          />
        </div>

        {/* 해상도 */}
        <div>
          <label className="block mb-2 font-medium">해상도</label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full p-2 rounded text-black"
          >
            <option value="">선택하세요</option>
            <option value="FHD">FHD (1920x1080)</option>
            <option value="QHD">QHD (2560x1440)</option>
            <option value="4K">4K (3840x2160)</option>
          </select>
        </div>

        {/* 그래픽 품질 */}
        <div>
          <label className="block mb-2 font-medium">그래픽 품질</label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="w-full p-2 rounded text-black"
          >
            <option value="">선택하세요</option>
            <option value="low">낮음</option>
            <option value="medium">중간</option>
            <option value="high">높음</option>
            <option value="ultra">최상</option>
          </select>
        </div>

        {/* 목표 FPS */}
        <div>
          <label className="block mb-2 font-medium">목표 FPS</label>
          <select
            value={fps}
            onChange={(e) => setFps(e.target.value)}
            className="w-full p-2 rounded text-black"
          >
            <option value="">선택하세요</option>
            <option value="60">60 FPS</option>
            <option value="144">144 FPS</option>
            <option value="240">240 FPS</option>
          </select>
        </div>
      </div>

      {/* 추천 버튼 */}
      <div className="flex justify-end mt-8">
        <button
          disabled={!gameName || !resolution || !quality || !fps}
          className={`px-8 py-3 text-lg font-bold rounded-lg transition
            ${gameName && resolution && quality && fps
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
        >
          추천 받기
        </button>
      </div>
    </motion.div>
  );
}
