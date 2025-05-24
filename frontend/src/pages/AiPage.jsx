import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackIcon from "../assets/iconIMG/previous.png";
import RobotIcon from "../assets/iconIMG/robot.png"; // ✅ AI 아이콘 추가

export default function AiOptionPage() {
  const navigate = useNavigate();
  const [model, setModel] = useState("");
  const [mode, setMode] = useState("");
  const [vram, setVram] = useState("");

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
        onClick={() => navigate("/")}
        className="absolute top-[1.25rem] left-4 p-2 hover:opacity-80 transition"
      >
        <img src={BackIcon} alt="뒤로가기" className="w-6 h-6 invert" />
      </button>

      {/* 제목 + 아이콘 */}
      <h2 className="text-2xl font-bold mb-8 text-left ml-12 flex items-center">
        <img src={RobotIcon} alt="AI 아이콘" className="w-6 h-6 mr-2" />
        AI 작업 옵션 선택
      </h2>

      {/* 카드형 UI */}
      <div className="bg-gray-900 rounded-xl p-6 space-y-6">
        {/* 모델명 */}
        <div>
          <label className="block mb-2 font-medium">모델명</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full p-2 rounded text-black"
            placeholder="예: Llama2"
          />
        </div>

        {/* 추론/학습 여부 */}
        <div>
          <label className="block mb-2 font-medium">작업 유형</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full p-2 rounded text-black"
          >
            <option value="">선택하세요</option>
            <option value="inference">추론만 수행</option>
            <option value="training">학습 포함</option>
          </select>
        </div>

        {/* VRAM 요구량 */}
        <div>
          <label className="block mb-2 font-medium">VRAM 요구량</label>
          <select
            value={vram}
            onChange={(e) => setVram(e.target.value)}
            className="w-full p-2 rounded text-black"
          >
            <option value="">선택하세요</option>
            <option value="8">8GB 이하</option>
            <option value="12">12GB</option>
            <option value="24">24GB 이상</option>
          </select>
        </div>
      </div>

      {/* 추천 버튼 */}
      <div className="flex justify-end mt-8">
        <button
          disabled={!model || !mode || !vram}
          className={`px-8 py-3 text-lg font-bold rounded-lg transition
            ${model && mode && vram
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
