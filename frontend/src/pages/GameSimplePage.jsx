import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import BackIcon from "../assets/iconIMG/previous.png";
import StickIcon from "../assets/iconIMG/stick.png";
import minIcon from "../assets/iconIMG/min.png";
import recomandIcon from "../assets/iconIMG/recomand.png";
import gameSpecs from "../data/gameSpecs.json"; // 공식 게임 사양 json

const gameNames = Object.keys(gameSpecs);
const fuse = new Fuse(gameNames, { threshold: 0.4 });

export default function SimpleGamePage() {
  const navigate = useNavigate();
  const [gameName, setGameName] = useState("");
  const [level, setLevel] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // 입력값 바뀔 때마다 자동완성 리스트 생성
  const handleGameNameChange = (e) => {
    const value = e.target.value;
    setGameName(value);

    if (value.length > 0) {
      const results = fuse.search(value).map(res => res.item);
      setSuggestions(results.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  // 추천 클릭 시 자동입력
  const handleSuggestionClick = (name) => {
    setGameName(name);
    setSuggestions([]);
  };

  // 추천 받기 버튼 클릭 시 공식 사양 페이지로 이동
  const handleRecommend = () => {
    const officialGameName =
      fuse.search(gameName)[0]?.item || gameName;
    const specs = gameSpecs[officialGameName]?.[level];

    if (!specs) {
      alert("해당 게임의 사양 정보가 없습니다!");
      return;
    }
    navigate("/game/simple/result", {
      state: {
        name: officialGameName,
        level,
        ...specs,
      },
    });
  };

  return (
    <motion.div
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-6"
    >
      {/* 상단: 뒤로가기 + 제목 row */}
      <div className="flex items-center w-full max-w-xl mb-8">
        <button
          onClick={() => navigate("/game")}
          className="mr-4 p-2 hover:opacity-80 transition z-10"
          style={{ minWidth: "2.5rem" }}
        >
          <img src={BackIcon} alt="뒤로가기" className="w-6 h-6 invert" />
        </button>
        <h2 className="text-2xl font-bold flex items-center truncate">
          <img src={StickIcon} alt="초보자 아이콘" className="w-6 h-6 mr-2" />
          게임 간편 추천
        </h2>
      </div>

      {/* 전체 입력 카드 */}
      <div className="w-full max-w-xl bg-white/10 rounded-2xl shadow-xl p-8 border border-white/10 flex flex-col gap-8">
        {/* 게임명 입력 */}
        <div className="relative">
          <label className="block mb-2 font-medium text-base">게임명</label>
          <input
            type="text"
            value={gameName}
            onChange={handleGameNameChange}
            className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
            placeholder="예: League of Legends"
            autoComplete="off"
          />
          {/* 자동완성 리스트 */}
          {suggestions.length > 0 && (
            <ul className="absolute z-20 w-full bg-white text-black rounded shadow mt-1 left-0 border">
              {suggestions.map((name) => (
                <li
                  key={name}
                  className="cursor-pointer px-3 py-2 hover:bg-blue-200"
                  onClick={() => handleSuggestionClick(name)}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 사양 선택 */}
        <div>
          <label className="block mb-4 font-medium text-base">원하는 사양 수준</label>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setLevel("minimum")}
              className={`p-6 rounded-lg text-center border cursor-pointer shadow transition duration-200
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
              className={`p-6 rounded-lg text-center border cursor-pointer shadow transition duration-200
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
        <div className="flex justify-end">
          <button
            onClick={handleRecommend}
            disabled={!gameName || !level}
            className={`px-8 py-3 text-lg font-bold rounded-xl shadow transition
              ${gameName && level
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
