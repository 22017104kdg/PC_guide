import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackIcon from "../assets/iconIMG/previous.png";
import RobotIcon from "../assets/iconIMG/robot.png";

const MODEL_LIST = [
  "Llama 3", "Mixtral", "Gemma", "Phi 3", "Qwen2", "Stable Diffusion", "Whisper"
];

const STAGE_LIST = [
  { label: "최대 7B 이하 모델 (입문)", value: "7B" },
  { label: "최대 13B 모델 (중급)", value: "13B" },
  { label: "최대 70B 이상 (고급/서버)", value: "70B" }
];

export default function AiOptionPage() {
  const navigate = useNavigate();
  const [model, setModel] = useState("");
  const [mode, setMode] = useState("");
  const [stage, setStage] = useState("");

  // 추천버튼 활성화 조건
  const isValid = model && mode && stage;

  return (
    <motion.div
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-xl bg-white/10 rounded-2xl shadow-xl p-8 border border-white/10 flex flex-col gap-8">
        {/* 상단: 뒤로가기+제목 */}
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate("/")}
            className="mr-4 p-2 hover:opacity-80 transition z-10"
            style={{ minWidth: "2.5rem" }}
          >
            <img src={BackIcon} alt="뒤로가기" className="w-6 h-6 invert" />
          </button>
          <h2 className="text-2xl font-bold flex items-center truncate">
            <img src={RobotIcon} alt="AI 아이콘" className="w-6 h-6 mr-2" />
            AI 작업 옵션 선택
          </h2>
        </div>

        {/* 입력 폼 */}
        <div className="flex flex-col gap-8">
          {/* 모델명 (자동완성) */}
          <div>
            <label className="block mb-2 font-medium text-base">모델명</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              list="model-list"
              className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
              placeholder="예: Llama 3"
              autoComplete="off"
            />
            <datalist id="model-list">
              {MODEL_LIST.map(m => <option key={m} value={m} />)}
            </datalist>
          </div>

          {/* 작업유형 */}
          <div>
            <label className="block mb-2 font-medium text-base">작업유형</label>
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
            >
              <option value="">선택하세요</option>
              <option value="inference">추론만 수행</option>
              <option value="training">학습 포함</option>
            </select>
          </div>

          {/* 단계별(모델 크기) */}
          <div>
            <label className="block mb-2 font-medium text-base">단계별 (모델 크기)</label>
            <select
              value={stage}
              onChange={e => setStage(e.target.value)}
              className="w-full p-3 rounded-lg text-black text-base outline-none focus:ring-2 ring-blue-400"
            >
              <option value="">선택하세요</option>
              {STAGE_LIST.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 추천 버튼 */}
        <div className="flex justify-end">
          <button
            disabled={!isValid}
            onClick={() => {
              navigate("/ai/result", {  // 여기를 /ai/result 로 수정
                state: { model, mode, stage }
              });
            }}
            className={`px-8 py-3 text-lg font-bold rounded-xl shadow transition
              ${isValid
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
