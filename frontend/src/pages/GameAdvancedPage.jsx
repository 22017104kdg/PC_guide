import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BackIcon from "../assets/iconIMG/previous.png";
import StickIcon from "../assets/iconIMG/stick.png";

const GAME_LIST = [
  "League of Legends",
  "Valorant",
  "Overwatch",
  "PUBG",
  "Lost Ark",
  "MapleStory",
  "Elden Ring",
  "GTA V",
  "Minecraft (Java)",
  "Cyberpunk 2077",
  "Diablo 4",
  "Fortnite",
  "Apex Legends",
  "FIFA Online 4",
  "CS:GO",
  "Red Dead Redemption 2",
  "The Witcher 3: Wild Hunt",
  "Monster Hunter: World",
  "Monster Hunter: Wilds",
];

const resolutionMap = {
  FHD: "1920x1080",
  QHD: "2560x1440",
  "4K": "3840x2160",
};

const qualityMap = {
  low: "VeryLow",
  medium: "Medium",
  high: "High",
  ultra: "Ultra",
};

export default function GameAdvancedPage() {
  const navigate = useNavigate();

  const [gameName, setGameName] = useState("");
  const [resolution, setResolution] = useState("");
  const [quality, setQuality] = useState("");
  const [fps, setFps] = useState("");
  const [filteredGames, setFilteredGames] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [gameFpsTable, setGameFpsTable] = useState({});
  const inputRef = useRef(null);

  // 자동완성 필터링
  useEffect(() => {
    if (!gameName.trim()) {
      setFilteredGames([]);
      setShowDropdown(false);
      return;
    }
    const filtered = GAME_LIST.filter((g) =>
      g.toLowerCase().includes(gameName.toLowerCase())
    );
    setFilteredGames(filtered);
    setShowDropdown(filtered.length > 0);
  }, [gameName]);

  // 성능 테이블 로드 (경로 수정!)
  useEffect(() => {
    fetch("/PC_guide/data/game_fps_table.json")
      .then((res) => res.json())
      .then(setGameFpsTable)
      .catch(() => setGameFpsTable({}));
  }, []);

  function selectGame(name) {
    setGameName(name);
    setShowDropdown(false);
    inputRef.current.focus();
  }

  function handleSubmit() {
    if (!gameName || !resolution || !quality || !fps) {
      alert("모든 항목을 선택해주세요.");
      return;
    }
    const table = gameFpsTable[gameName];
    if (!table) {
      alert("해당 게임 데이터가 없습니다.");
      return;
    }
    const key = `${resolutionMap[resolution]}_${qualityMap[quality]}_${fps}`;
    const scoreObj = table[key];
    if (!scoreObj) {
      alert("해당 옵션에 맞는 성능 데이터가 없습니다.");
      return;
    }
    navigate("/game/advanced/result", {
      state: {
        gameName,
        cpu_score: scoreObj.cpu_score,
        gpu_score: scoreObj.gpu_score,
        selectedOptions: { resolution, quality, fps },
      },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-6">
      {/* 상단: 뒤로가기 + 제목 */}
      <div className="flex items-center w-full max-w-xl mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:opacity-80 transition"
        >
          <img src={BackIcon} alt="뒤로가기" className="w-6 h-6 invert" />
        </button>
        <h2 className="text-2xl font-bold flex items-center">
          <img src={StickIcon} alt="옵션 아이콘" className="w-6 h-6 mr-2" />
          게임 옵션 선택
        </h2>
      </div>

      {/* 게임명 입력 */}
      <div className="w-full max-w-xl relative mb-6">
        <label className="block mb-2 font-medium text-base">게임명</label>
        <input
          type="text"
          ref={inputRef}
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          onFocus={() => filteredGames.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
          placeholder="게임명을 입력하세요"
          autoComplete="off"
        />
        {showDropdown && (
          <ul className="absolute bg-white text-black w-full rounded-b-lg shadow-lg max-h-60 overflow-auto z-50">
            {filteredGames.map((game, idx) => (
              <li
                key={idx}
                onMouseDown={() => selectGame(game)}
                className="p-2 cursor-pointer hover:bg-blue-500 hover:text-white"
              >
                {game}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 해상도 선택 */}
      <div className="w-full max-w-xl mb-6">
        <label className="block mb-2 font-medium text-base">해상도</label>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
        >
          <option value="">선택하세요</option>
          <option value="FHD">FHD (1920x1080)</option>
          <option value="QHD">QHD (2560x1440)</option>
          <option value="4K">4K (3840x2160)</option>
        </select>
      </div>

      {/* 그래픽 품질 선택 */}
      <div className="w-full max-w-xl mb-6">
        <label className="block mb-2 font-medium text-base">그래픽 품질</label>
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
        >
          <option value="">선택하세요</option>
          <option value="low">낮음</option>
          <option value="medium">중간</option>
          <option value="high">높음</option>
          <option value="ultra">최상</option>
        </select>
      </div>

      {/* 목표 FPS 선택 */}
      <div className="w-full max-w-xl mb-6">
        <label className="block mb-2 font-medium text-base">목표 FPS</label>
        <select
          value={fps}
          onChange={(e) => setFps(e.target.value)}
          className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
        >
          <option value="">선택하세요</option>
          <option value="60">60 FPS</option>
          <option value="144">144 FPS</option>
          <option value="240">240 FPS</option>
        </select>
      </div>

      {/* 추천 버튼 */}
      <div className="w-full max-w-xl flex justify-end">
        <button
          disabled={!gameName || !resolution || !quality || !fps}
          onClick={handleSubmit}
          className={`px-8 py-3 text-lg font-bold rounded-xl shadow transition ${
            gameName && resolution && quality && fps
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-600 text-gray-300 cursor-not-allowed"
          }`}
        >
          추천 받기
        </button>
      </div>
    </div>
  );
}
