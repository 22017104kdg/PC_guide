import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackIcon from "../assets/iconIMG/previous.png";
import ModelIcon from "../assets/iconIMG/3dmodel.png"; // ✅ 아이콘 추가

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
        <img src={ModelIcon} alt="3D 모델 아이콘" className="w-6 h-6 mr-2" />
        3D 작업 옵션 선택
      </h2>

      {/* 카드형 UI */}
      <div className="bg-gray-900 rounded-xl p-6 space-y-6">
        {/* 프로그램명 */}
        <div>
          <label className="block mb-2 font-medium">사용 프로그램</label>
          <input
            type="text"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="w-full p-2 rounded text-black"
            placeholder="예: Blender"
          />
        </div>

        {/* 렌더링 방식 */}
        <div>
          <label className="block mb-2 font-medium">렌더링 방식</label>
          <select
            value={renderType}
            onChange={(e) => setRenderType(e.target.value)}
            className="w-full p-2 rounded text-black"
          >
            <option value="">선택하세요</option>
            <option value="realtime">실시간 렌더링</option>
            <option value="raytracing">레이트레이싱</option>
            <option value="hybrid">하이브리드</option>
          </select>
        </div>

        {/* 모델 복잡도 */}
        <div>
          <label className="block mb-2 font-medium">모델 복잡도</label>
          <select
            value={complexity}
            onChange={(e) => setComplexity(e.target.value)}
            className="w-full p-2 rounded text-black"
          >
            <option value="">선택하세요</option>
            <option value="simple">간단 (로우 폴리 등)</option>
            <option value="medium">중간 (일반 모델)</option>
            <option value="complex">복잡 (영화 수준)</option>
          </select>
        </div>
      </div>

      {/* 추천 버튼 */}
      <div className="flex justify-end mt-8">
        <button
          disabled={!program || !renderType || !complexity}
          className={`px-8 py-3 text-lg font-bold rounded-lg transition
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
