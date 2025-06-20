import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackIcon from "../assets/iconIMG/previous.png";
import VideoIcon from "../assets/iconIMG/video.png";

export default function TwoDOptionPage() {
  const navigate = useNavigate();
  const [program, setProgram] = useState("");
  const [resolution, setResolution] = useState("");
  const [complexity, setComplexity] = useState("");

  const PROGRAM_LIST = [
    "Photoshop", "Illustrator", "Lightroom", "Affinity Photo", "Affinity Designer",
    "CorelDRAW", "Clip Studio Paint", "PaintTool SAI", "Krita", "Corel Painter",
    "InDesign", "Capture One", "DxO PhotoLab",
    "Premiere Pro", "DaVinci Resolve", "Vegas Pro"
  ];
  const [filtered, setFiltered] = useState([]);
  const [showDd, setShowDd] = useState(false);

  const onChangeProg = (e) => {
    const v = e.target.value;
    setProgram(v);
    if (!v) return setShowDd(false);
    setFiltered(PROGRAM_LIST.filter(p =>
      p.toLowerCase().includes(v.toLowerCase())
    ));
    setShowDd(true);
  };

  const selectProg = (p) => {
    setProgram(p);
    setShowDd(false);
  };

  return (
    <motion.div
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-xl bg-white/10 rounded-2xl shadow-xl p-8 border border-white/10 flex flex-col gap-8">
        {/* 제목 + 뒤로가기 (왼쪽 정렬) */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 hover:opacity-80 transition z-10"
          >
            <img src={BackIcon} alt="뒤로가기" className="w-6 h-6 invert" />
          </button>
          <h2 className="text-2xl font-bold flex items-center">
            <img src={VideoIcon} alt="2D 아이콘" className="w-6 h-6 mr-2" />
            2D 그래픽 작업 옵션 선택
          </h2>
        </div>

        {/* 프로그램명 (자동완성) */}
        <div className="relative">
          <label className="block mb-2 font-medium text-base">사용 프로그램</label>
          <input
            type="text"
            value={program}
            onChange={onChangeProg}
            onBlur={() => setTimeout(() => setShowDd(false), 100)}
            onFocus={() => program && setShowDd(true)}
            className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
            placeholder="예: Photoshop"
            autoComplete="off"
          />
          {showDd && (
            <ul className="absolute bg-white text-black w-full rounded-b-lg shadow-lg max-h-40 overflow-auto z-50">
              {filtered.map((p, i) => (
                <li
                  key={i}
                  onMouseDown={() => selectProg(p)}
                  className="p-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                >
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 해상도 */}
        <div>
          <label className="block mb-2 font-medium text-base">작업 해상도</label>
          <select
            value={resolution}
            onChange={e => setResolution(e.target.value)}
            className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
          >
            <option value="">선택하세요</option>
            <option value="FHD">FHD (1920x1080)</option>
            <option value="QHD">QHD (2560x1440)</option>
            <option value="4K">4K (3840x2160)</option>
          </select>
        </div>

        {/* 작업 복잡도 */}
        <div>
          <label className="block mb-2 font-medium text-base">작업 복잡도</label>
          <select
            value={complexity}
            onChange={e => setComplexity(e.target.value)}
            className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
          >
            <option value="">선택하세요</option>
            <option value="low">
              간단 (사진/이미지 한두 장 편집, 텍스트 추가 정도)
            </option>
            <option value="medium">
              보통 (10개 내외 레이어, RAW/PSD, 효과 몇 개 적용)
            </option>
            <option value="high">
              복잡 (20개 이상 레이어, 여러 효과/필터, 대용량/고해상도 파일)
            </option>
          </select>
        </div>

        {/* 추천 받기 버튼 */}
        <div className="flex justify-end">
          <button
            disabled={!program || !resolution || !complexity}
            onClick={() =>
              navigate("/2d/options/result", { state: { program, resolution, complexity } })
            }
            className={`px-8 py-3 text-lg font-bold rounded-xl shadow transition ${
              program && resolution && complexity
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            추천 받기
          </button>
        </div>
      </div>
    </motion.div>
  );
}
