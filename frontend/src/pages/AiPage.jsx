import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackIcon from "../assets/iconIMG/previous.png";
import RobotIcon from "../assets/iconIMG/robot.png";

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
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-6"
    >
      {/* 상단: 뒤로가기+제목 */}
      <div className="flex items-center w-full max-w-xl mb-8">
        <button
          onClick={() => navigate("/")}
          className="mr-4 p-2 hover:opacity-80 transition z-10"
          style={{ minWidth: "2.5rem" }}
        >
          <img src={BackIcon} alt="뒤로가기" className="w-6 h-6 invert" />
        </button>
        <h2 className="text-2xl font-bold flex items-center truncate">
          <img src={RobotIcon} alt="AI 아이콘" className="w-6 h-6 mr-2" />
          AI 작업 옵션 선택
        </h2>
      </div>

      {/* 입력 카드 */}
      <div className="w-full max-w-xl bg-white/10 rounded-2xl shadow-xl p-8 border border-white/10 flex flex-col gap-8">
        {/* 모델명 */}
        <div>
          <label className="block mb-2 font-medium text-base">모델명</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
            placeholder="예: Llama2"
          />
        </div>
        {/* 작업 유형 */}
        <div>
          <label className="block mb-2 font-medium text-base">작업 유형</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
          >
            <option value="">선택하세요</option>
            <option value="inference">추론만 수행</option>
            <option value="training">학습 포함</option>
          </select>
        </div>
        {/* VRAM 요구량 */}
        <div>
          <label className="block mb-2 font-medium text-base">VRAM 요구량</label>
          <select
            value={vram}
            onChange={(e) => setVram(e.target.value)}
            className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
          >
            <option value="">선택하세요</option>
            <option value="8">8GB 이하</option>
            <option value="12">12GB</option>
            <option value="24">24GB 이상</option>
          </select>
        </div>
      </div>

      {/* 추천 버튼 */}
      <div className="flex justify-end w-full max-w-xl mt-8">
        <button
          disabled={!model || !mode || !vram}
          className={`px-8 py-3 text-lg font-bold rounded-xl shadow transition
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
