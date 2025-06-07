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
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-xl bg-white/10 rounded-2xl shadow-xl p-10 border border-white/10 flex flex-col gap-8 items-center">
        {/* 상단: 뒤로가기+제목 */}
        <div className="flex items-center w-full mb-2">
          <button
            onClick={() => navigate("/")}
            className="mr-4 p-2 hover:opacity-80 transition z-10"
            style={{ minWidth: "2.5rem" }}
          >
            <img src={BackIcon} alt="뒤로가기" className="w-6 h-6 invert" />
          </button>
          <h1 className="text-2xl font-bold flex items-center truncate">
            게임 견적 유형 선택
            <span className="ml-2 text-sm font-normal text-gray-400 align-middle">
              원하는 방식을 골라주세요⭐
            </span>
          </h1>
        </div>

        {/* 옵션 카드 컨테이너 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => navigate(opt.path)}
              className="cursor-pointer p-8 bg-gray-800/80 text-gray-200 border border-gray-700
                         rounded-2xl shadow-lg text-center flex flex-col items-center
                         transition-all duration-200 transform hover:scale-105 hover:z-10
                         hover:bg-blue-600 hover:text-white hover:border-blue-400"
            >
              <img
                src={opt.icon}
                alt={opt.label}
                className="w-14 h-14 mb-3"
              />
              <span className="text-xl font-semibold">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
