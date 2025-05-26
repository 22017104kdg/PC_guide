import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackIcon from "../assets/iconIMG/previous.png";
import ModelIcon from "../assets/iconIMG/3dmodel.png";

export default function ThreeDOptionPage() {
  const navigate = useNavigate();
  const [program, setProgram] = useState("");
  const [renderType, setRenderType] = useState("");
  const [complexity, setComplexity] = useState("");

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
          <img src={ModelIcon} alt="3D 모델 아이콘" className="w-6 h-6 mr-2" />
          3D 작업 옵션 선택
        </h2>
      </div>

      {/* 입력 카드 */}
      <div className="w-full max-w-xl bg-white/10 rounded-2xl shadow-xl p-8 border border-white/10 flex flex-col gap-8">
        {/* 프로그램명 */}
        <div>
          <label className="block mb-2 font-medium text-base">사용 프로그램</label>
          <input
            type="text"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
            placeholder="예: Blender"
          />
        </div>
        {/* 렌더링 방식 */}
        <div>
          <label className="block mb-2 font-medium text-base">렌더링 방식</label>
          <select
            value={renderType}
            onChange={(e) => setRenderType(e.target.value)}
            className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
          >
            <option value="">선택하세요</option>
            <option value="realtime">실시간 렌더링</option>
            <option value="raytracing">레이트레이싱</option>
            <option value="hybrid">하이브리드</option>
          </select>
        </div>
        {/* 모델 복잡도 */}
        <div>
          <label className="block mb-2 font-medium text-base">모델 복잡도</label>
          <select
            value={complexity}
            onChange={(e) => setComplexity(e.target.value)}
            className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
          >
            <option value="">선택하세요</option>
            <option value="simple">간단 (로우 폴리 등)</option>
            <option value="medium">중간 (일반 모델)</option>
            <option value="complex">복잡 (영화 수준)</option>
          </select>
        </div>
      </div>

      {/* 추천 버튼 */}
      <div className="flex justify-end w-full max-w-xl mt-8">
        <button
          disabled={!program || !renderType || !complexity}
          className={`px-8 py-3 text-lg font-bold rounded-xl shadow transition
            ${program && renderType && complexity
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
