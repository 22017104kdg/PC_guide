import { useNavigate } from "react-router-dom";
import { useState } from "react";
import gameImg from "../assets/iconIMG/game.png";
import img2d from "../assets/iconIMG/2d.png";
import img3d from "../assets/iconIMG/3d.png";
import imgAi from "../assets/iconIMG/ai.png";
import faqIcon from "../assets/iconIMG/faq.png";

export default function Home() {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState("");
  const [showFaq, setShowFaq] = useState(false);

  const options = [
    { value: "game", label: "게임", img: gameImg },
    { value: "2d", label: "2D 그래픽", img: img2d },
    { value: "3d", label: "3D 그래픽", img: img3d },
    { value: "ai", label: "AI 작업", img: imgAi },
  ];

  const handleClick = (value) => {
    setPurpose(value);
    if (value === "game") navigate("/game");
    else if (value === "2d") navigate("/2d");
    else if (value === "3d") navigate("/3d");
    else if (value === "ai") navigate("/ai");
  };

  return (
    <div className="flex h-screen bg-black text-white relative">
      <div className="w-full p-6">
        {/* FAQ 아이콘 + 제목 */}
        <div className="flex items-center gap-3 mb-8">
          <img
            src={faqIcon}
            alt="FAQ"
            title="도움말"
            onClick={() => setShowFaq(true)}
            className="w-6 h-6 cursor-pointer hover:scale-110 hover:opacity-80 transform transition-transform duration-200"
          />
          <h1 className="text-2xl font-bold whitespace-nowrap">
            PC 견적 추천 시스템
            <span className="ml-2 text-sm font-normal text-gray-400 align-middle">
              용도 선택 해주세요⭐
            </span>
          </h1>
        </div>

        {/* 카드 UI */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleClick(opt.value)}
              className="cursor-pointer p-6 border rounded-lg text-center
                         bg-gray-800 text-gray-200 border-gray-600
                         transform hover:scale-105 hover:z-10
                         transition-all duration-200
                         hover:bg-blue-600 hover:text-white hover:border-blue-400"
            >
              <img
                src={opt.img}
                alt={opt.label}
                className="w-12 h-12 mx-auto mb-2"
              />
              <span className="text-xl font-semibold">{opt.label}</span>
            </div>
          ))}
        </div>

        {/* 선택 결과 표시 */}
        {purpose && (
          <div className="mt-4">
            <p className="text-gray-300">
              ✅ <strong>{purpose}</strong> 용도 조건 입력 UI가 여기에 표시될 예정입니다.
            </p>
          </div>
        )}
      </div>

      {/* ✅ FAQ 설명 모달 with 배경 흐림 효과 */}
      {showFaq && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg max-w-md w-full text-lg">
            <h2 className="text-2xl font-semibold mb-4">무엇을 하는 사이트인가요?</h2>
            <p className="mb-6 leading-relaxed font-bold">
              💡 목적에 맞는 최적의 부품 추천,<br />
              호환성 자동 검사,<br />
              실시간 인기·최저가 마켓 정보를 제공합니다.
            </p>
            <button
              onClick={() => setShowFaq(false)}
              className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-base"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
