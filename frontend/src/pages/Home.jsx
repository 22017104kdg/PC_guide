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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-6">
      {/* FAQ + 제목 라인 */}
      <div className="flex items-center w-full max-w-xl mb-8">
        <img
          src={faqIcon}
          alt="FAQ"
          title="도움말"
          onClick={() => setShowFaq(true)}
          className="w-6 h-6 cursor-pointer hover:scale-110 hover:opacity-80 transition-transform mr-3"
        />
        <h1 className="text-2xl font-bold flex items-center truncate">
          PC 견적 추천 시스템
          <span className="ml-2 text-sm font-normal text-gray-400 align-middle">
            용도 선택 해주세요⭐
          </span>
        </h1>
      </div>

      {/* 전체 카드 */}
      <div className="w-full max-w-xl bg-white/10 rounded-2xl shadow-xl p-10 border border-white/10 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-4">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleClick(opt.value)}
              className="cursor-pointer p-8 bg-gray-800/80 text-gray-200 border border-gray-700
                        rounded-2xl shadow-lg text-center flex flex-col items-center
                        transition-all duration-200 transform hover:scale-105 hover:z-10
                        hover:bg-blue-600 hover:text-white hover:border-blue-400"
            >
              <img
                src={opt.img}
                alt={opt.label}
                className="w-14 h-14 mb-3"
              />
              <span className="text-xl font-semibold">{opt.label}</span>
            </div>
          ))}
        </div>

        {/* 선택 결과 표시 */}
        {purpose && (
          <div className="mt-4 w-full">
            <p className="text-gray-300">
              ✅ <strong>{purpose}</strong> 용도 조건 입력 UI가 여기에 표시될 예정입니다.
            </p>
          </div>
        )}
      </div>

      {/* FAQ 설명 모달 */}
      {showFaq && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white text-black p-7 rounded-2xl shadow-2xl max-w-md w-full text-lg border-2 border-blue-600">
            <h2 className="text-2xl font-semibold mb-4">무엇을 하는 사이트인가요?</h2>
            <p className="mb-6 leading-relaxed font-bold">
              💡 목적에 맞는 최적의 부품 추천,<br />
              호환성 자동 검사,<br />
              실시간 인기·최저가 마켓 정보를 제공합니다.
            </p>
            <button
              onClick={() => setShowFaq(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base font-bold shadow"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
