import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackIcon from "../assets/iconIMG/previous.png";
import VideoIcon from "../assets/iconIMG/video.png"; // ✅ 아이콘 import

export default function TwoDOptionPage() {
  const navigate = useNavigate();
  const [program, setProgram] = useState("");
  const [resolution, setResolution] = useState("");
  const [imageSize, setImageSize] = useState("");

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
        <img src={VideoIcon} alt="2D 아이콘" className="w-6 h-6 mr-2" />
        2D 그래픽 작업 옵션 선택
      </h2>

      {/* 카드형 입력 UI */}
      <div className="bg-gray-900 rounded-xl p-6 space-y-6">
        {/* 프로그램명 */}
        <div>
          <label className="block mb-2 font-medium">사용 프로그램</label>
          <input
            type="text"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="w-full p-2 rounded text-black"
            placeholder="예: Photoshop"
          />
        </div>

        {/* 작업 해상도 */}
        <div>
          <label className="block mb-2 font-medium">작업 해상도</label>
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

        {/* 이미지 크기 */}
        <div>
          <label className="block mb-2 font-medium">이미지 크기</label>
          <select
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value)}
            className="w-full p-2 rounded text-black"
          >
            <option value="">선택하세요</option>
            <option value="small">작음 (5MB 이하)</option>
            <option value="medium">중간 (5MB ~ 20MB)</option>
            <option value="large">큼 (20MB 이상)</option>
          </select>
        </div>
      </div>

      {/* 추천 버튼 */}
      <div className="flex justify-end mt-8">
        <button
          disabled={!program || !resolution || !imageSize}
          className={`px-8 py-3 text-lg font-bold rounded-lg transition
            ${program && resolution && imageSize
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
