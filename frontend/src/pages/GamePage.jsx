import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BackIcon from "../assets/iconIMG/previous.png";
import easyIcon from "../assets/iconIMG/easy.png";
import normalIcon from "../assets/iconIMG/normal.png";

export default function GamePage() {
  const navigate = useNavigate();

  const options = [
    {
      value: "simple",
      label: "간편 추천",
      path: "/game/simple",
      icon: easyIcon,
    },
    {
      value: "advanced",
      label: "직접 옵션 선택",
      path: "/game/advanced",
      icon: normalIcon,
    },
  ];

  return (
    <motion.div
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="flex h-screen bg-black text-white"
    >
      <div className="w-full p-6">
        {/* 🔙 홈으로 뒤로가기 버튼 */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-[1.25rem] left-4 p-2 hover:opacity-80 transition"
        >
          <img src={BackIcon} alt="뒤로가기" className="w-6 h-6 invert" />
        </button>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-left mb-8 pl-10">
          게임 견적 유형 선택
          <span className="ml-2 text-sm font-normal text-gray-400 align-middle">
            원하는 방식을 골라주세요⭐
          </span>
        </h1>

        {/* 카드형 UI */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => navigate(opt.path)}
              className="cursor-pointer p-6 border rounded-lg text-center
                         bg-gray-800 text-gray-200 border-gray-600
                         transform hover:scale-105 hover:z-10
                         transition-all duration-200
                         hover:bg-blue-600 hover:text-white hover:border-blue-400"
            >
              <img
                src={opt.icon}
                alt={opt.label}
                className="w-12 h-12 mx-auto mb-2"
              />
              <span className="text-xl font-semibold">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
