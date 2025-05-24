import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackIcon from "../assets/iconIMG/previous.png";
import StickIcon from "../assets/iconIMG/stick.png"; // ✅ 아이콘 추가
import minIcon from "../assets/iconIMG/min.png";
import recomandIcon from "../assets/iconIMG/recomand.png";

export default function SimpleGamePage() {
  const navigate = useNavigate();
  const [gameName, setGameName] = useState("");
  const [level, setLevel] = useState("");

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
        <img src={StickIcon} alt="초보자 아이콘" className="w-6 h-6 mr-2" />
        게임 간편 추천
      </h2>

      {/* 게임명 입력 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">게임명</label>
        <input
          type="text"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          className="w-full p-2 rounded text-black"
          placeholder="예: League of Legends"
        />
      </div>

      {/* 사양 선택 */}
      <div className="mb-6">
        <label className="block mb-4 font-medium">원하는 사양 수준</label>
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setLevel("minimum")}
            className={`p-6 rounded-lg text-center border cursor-pointer transform transition duration-200
              ${level === "minimum"
                ? "bg-blue-600 text-white border-blue-400 scale-105 z-10"
                : "bg-gray-800 text-gray-200 border-gray-600 hover:scale-105 hover:z-10 hover:bg-blue-600 hover:text-white hover:border-blue-400"
              }`}
          >
            <img
              src={minIcon}
              alt="최소사양"
              className="w-10 h-10 mx-auto mb-2"
            />
            <p className="text-xl font-semibold">최소 사양</p>
          </div>

          <div
            onClick={() => setLevel("recommended")}
            className={`p-6 rounded-lg text-center border cursor-pointer transform transition duration-200
              ${level === "recommended"
                ? "bg-blue-600 text-white border-blue-400 scale-105 z-10"
                : "bg-gray-800 text-gray-200 border-gray-600 hover:scale-105 hover:z-10 hover:bg-blue-600 hover:text-white hover:border-blue-400"
              }`}
          >
            <img
              src={recomandIcon}
              alt="권장사양"
              className="w-10 h-10 mx-auto mb-2"
            />
            <p className="text-xl font-semibold">권장 사양</p>
          </div>
        </div>
      </div>

      {/* 추천 버튼 */}
      <div className="flex justify-end mt-8">
        <button
          disabled={!gameName || !level}
          className={`px-8 py-3 text-lg font-bold rounded-lg transition
            ${gameName && level
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
