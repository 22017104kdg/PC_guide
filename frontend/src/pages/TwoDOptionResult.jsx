// TwoDRecommendResult.jsx
import { useLocation, useNavigate } from "react-router-dom";

const CPU_TIERS = [
  { model: "Ryzen 5 5600X", minScore: 1300 },
  { model: "Core i5-12600K", minScore: 1800 },
  { model: "Ryzen 7 7700X", minScore: 2000 },
  { model: "Ryzen 9 7950X", minScore: 2500 },
];

export default function TwoDRecommendResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  if (!state) return <button onClick={() => navigate(-1)}>뒤로가기</button>;

  const { program, resolution, imageSize } = state;

  // 옵션별로 필요한 최소 벤치 점수 계산 함수
  function requiredScore({ resolution, imageSize }) {
    let base = 1200; // 기본 Photoshop/FHD
    if (program.includes("Premiere")) base = 1400;
    if (resolution === "QHD") base += 200;
    if (resolution === "4K") base += 400;
    if (imageSize === "medium") base += 100;
    if (imageSize === "large") base += 200;
    return base;
  }
  const target = requiredScore({ resolution, imageSize });

  // 가장 적합한 CPU 선택
  const cpu = [...CPU_TIERS].reverse().find(t => t.minScore >= target) 
              || CPU_TIERS[0];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">2D 그래픽 PC 추천 결과</h2>
      <p>프로그램: {program}</p>
      <p>해상도: {resolution}</p>
      <p>파일 크기: {imageSize}</p>
      <hr className="my-4"/>
      <h3 className="text-xl font-semibold">추천 CPU</h3>
      <p>{cpu.model} (벤치 점수 최소 {cpu.minScore} 이상 필요)</p>
      <button className="mt-6 px-4 py-2 bg-gray-700 rounded" onClick={() => navigate(-1)}>
        뒤로가기
      </button>
    </div>
  );
}
