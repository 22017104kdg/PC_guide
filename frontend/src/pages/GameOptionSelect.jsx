import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackIcon from "../assets/iconIMG/previous.png";
import BulbIcon from "../assets/iconIMG/bulb.png";
import NvidiaIcon from "../assets/iconIMG/nvidia.png";
import AmdIcon from "../assets/iconIMG/amd.png";

export default function GameOptionSelect() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">추천 결과</h2>
        <p className="text-red-400 text-lg font-bold text-center">
          추천 데이터가 전달되지 않았습니다.
          <br />
          <span className="text-sm text-gray-400">
            이전 페이지에서 옵션을 선택 후 다시 시도해주세요.
          </span>
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-gray-700 rounded hover:bg-gray-600 transition text-white font-semibold"
        >
          뒤로가기
        </button>
      </div>
    );
  }

  const { gameName, cpu_score, gpu_score, selectedOptions } = state;
  const { resolution, quality, fps } = selectedOptions;

  // --- DB 상태 ---
  const [cpuDB, setCpuDB] = useState([]);
  const [gpuDB, setGpuDB] = useState([]);
  const [mainboardDB, setMainboardDB] = useState([]);
  const [ramDB, setRamDB] = useState([]);

  // --- 가격/URL 상태 ---
  const [cpuDanawa, setCpuDanawa] = useState([]);
  const [cpuBest, setCpuBest]     = useState([]);
  const [cpuNaver, setCpuNaver]   = useState([]);

  const [gpuDanawa, setGpuDanawa] = useState([]);
  const [gpuBest, setGpuBest]     = useState([]);
  const [gpuNaver, setGpuNaver]   = useState([]);

  const [mbDanawa, setMbDanawa] = useState([]);
  const [mbBest, setMbBest]     = useState([]);
  const [mbNaver, setMbNaver]   = useState([]);

  const [ramDanawa, setRamDanawa] = useState([]);
  const [ramBest, setRamBest]     = useState([]);
  const [ramNaver, setRamNaver]   = useState([]);

  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [gpuBrand, setGpuBrand]     = useState("any");

  // 가격·URL 링크 헬퍼
  function getLinks(model, dp, db, np) {
    const p = dp.find(i => i.model === model) || {};
    const b = db.find(i => i.model === model) || {};
    const n = np.find(i => i.model === model) || {};
    return [
      p.url && { label: "다나와 최저가", url: p.url, price: p.price },
      b.url && { label: "리뷰 많은순", url: b.url, price: b.price },
      n.url && { label: "네이버 인기순", url: n.url, price: n.price },
    ].filter(Boolean);
  }

  // GPU 필터
  function filterGpu(list, brand) {
    if (brand === "any") return list;
    const re = brand === "nvidia"
      ? /(nvidia|rtx|gtx)/i
      : /(amd|radeon)/i;
    return list.filter(i => re.test(i.model));
  }

  // 점수 기반 최적 파트 찾기
  function findBestPart(db, score, brand = "any") {
    let candidates = db.filter(i => Number(i.score) >= score);
    if (db === gpuDB) candidates = filterGpu(candidates, brand);
    if (!candidates.length) return null;
    const delta = Math.min(...candidates.map(i => i.score - score));
    candidates = candidates.filter(i => i.score - score === delta);
    return candidates.reduce((best, cur) =>
      (cur.price || Infinity) < (best.price || Infinity) ? cur : best
    );
  }

  // 데이터 로드
  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        setFetchError(false);
        const [
          cpuRes, gpuRes,
          cpuDP, cpuDBest, cpuNP,
          gpuDP, gpuDBest, gpuNP,
          mbAll, mbDP, mbDBest, mbNP,
          ramList, ramDP, ramDBest, ramNP
        ] = await Promise.all([
          fetch("/data/cpuDB.json").then(r => r.json()),
          fetch("/data/gpuDB.json").then(r => r.json()),

          fetch("/data/cpu_danawa_price.json").then(r => r.json()),
          fetch("/data/cpu_danawa_best.json").then(r => r.json()),
          fetch("/data/cpu_naver_price.json").then(r => r.json()),

          fetch("/data/gpu_danawa_price.json").then(r => r.json()),
          fetch("/data/gpu_danawa_best.json").then(r => r.json()),
          fetch("/data/gpu_naver_price.json").then(r => r.json()),

          // asus + msi + gigabyte 메인보드 합치기
          Promise.all([
            fetch("/data/asus_mainboard.json").then(r => r.json()),
            fetch("/data/msi_mainboard.json").then(r => r.json()),
            fetch("/data/gigabyte_mainboard.json").then(r => r.json()),
          ]).then(arr => arr.flat()),

          Promise.all([
            fetch("/data/asus_danawa_price.json").then(r=>r.json()),
            fetch("/data/msi_danawa_price.json").then(r=>r.json()),
            fetch("/data/gigabyte_danawa_price.json").then(r=>r.json()),
          ]).then(arr => arr.flat()),
          Promise.all([
            fetch("/data/asus_danawa_best.json").then(r=>r.json()),
            fetch("/data/msi_danawa_best.json").then(r=>r.json()),
            fetch("/data/gigabyte_danawa_best.json").then(r=>r.json()),
          ]).then(arr => arr.flat()),
          Promise.all([
            fetch("/data/asus_naver_price.json").then(r=>r.json()),
            fetch("/data/msi_naver_price.json").then(r=>r.json()),
            fetch("/data/gigabyte_naver_price.json").then(r=>r.json()),
          ]).then(arr => arr.flat()),

          fetch("/data/ramList.json").then(r=>r.json()),
          fetch("/data/ram_danawa_price.json").then(r=>r.json()),
          fetch("/data/ram_danawa_best.json").then(r=>r.json()),
          fetch("/data/ram_naver_price.json").then(r=>r.json()),
        ]);

        setCpuDB(Array.isArray(cpuRes) ? cpuRes : cpuRes.cpu || []);
        setGpuDB(Array.isArray(gpuRes) ? gpuRes : gpuRes.gpu || []);

        setCpuDanawa(cpuDP);
        setCpuBest(cpuDBest);
        setCpuNaver(cpuNP);

        setGpuDanawa(gpuDP);
        setGpuBest(gpuDBest);
        setGpuNaver(gpuNP);

        setMainboardDB(mbAll);
        setMbDanawa(mbDP);
        setMbBest(mbDBest);
        setMbNaver(mbNP);

        setRamDB(ramList);
        setRamDanawa(ramDP);
        setRamBest(ramDBest);
        setRamNaver(ramNP);

        setLoading(false);
      } catch (err) {
        console.error("데이터 로드 오류:", err);
        setFetchError(true);
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // CPU / GPU 추천
  const cpu = !loading && !fetchError ? findBestPart(cpuDB, cpu_score) : null;
  const gpu = !loading && !fetchError
    ? findBestPart(gpuDB, gpu_score, gpuBrand)
    : null;

  const cpuLinks = cpu ? getLinks(cpu.model, cpuDanawa, cpuBest, cpuNaver) : [];
  const gpuLinks = gpu ? getLinks(gpu.model, gpuDanawa, gpuBest, gpuNaver) : [];

  // 보드 브랜드별 하나씩만
  const allBoards = cpu
    ? mainboardDB.filter(mb => mb.socket?.toUpperCase() === cpu.socket?.toUpperCase())
    : [];
  const asus = allBoards.find(b => /asus/i.test(b.model));
  const msi  = allBoards.find(b => /msi/i.test(b.model));
  const gig  = allBoards.find(b => /gigabyte/i.test(b.model));
  const boardRecs = [asus, msi, gig].filter(Boolean).map(b => ({
    ...b,
    links: getLinks(b.model, mbDanawa, mbBest, mbNaver)
  }));

  // RAM 추천
  const memType = boardRecs[0]?.memory?.toUpperCase() || "DDR4";
  const sizeGb  = memType === "DDR5" ? 32 : 16;
  const ramRecs = ramDB
    .filter(r => r.type?.toUpperCase() === memType && r.size_gb === sizeGb)
    .slice(0, 3)
    .map(r => ({
      ...r,
      links: getLinks(r.model, ramDanawa, ramBest, ramNaver)
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-6">
      {/* 상단 */}
      <div className="flex items-center w-full max-w-xl mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:opacity-80 transition z-10"
        >
          <img src={BackIcon} alt="뒤로가기" className="w-6 h-6 invert" />
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {gameName} 사양 추천 결과
          <img src={BulbIcon} alt="bulb" className="w-7 h-7 ml-2" />
        </h2>
      </div>

      {/* GPU 브랜드 선택 */}
      <div className="mb-6 flex gap-2 items-center">
        <span className="font-medium">GPU 브랜드:</span>
        <button
          onClick={() => setGpuBrand("any")}
          className={`px-3 py-1 rounded ${
            gpuBrand === "any"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setGpuBrand("nvidia")}
          className={`px-3 py-1 rounded flex items-center ${
            gpuBrand === "nvidia"
              ? "bg-green-600 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          <img src={NvidiaIcon} alt="NVIDIA" className="w-5 h-5 mr-1" />
          NVIDIA
        </button>
        <button
          onClick={() => setGpuBrand("amd")}
          className={`px-3 py-1 rounded flex items-center ${
            gpuBrand === "amd"
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          <img src={AmdIcon} alt="AMD" className="w-5 h-5 mr-1" />
          AMD
        </button>
      </div>

      {/* 로딩/에러 */}
      {loading ? (
        <p className="text-gray-400">로딩 중...</p>
      ) : fetchError ? (
        <p className="text-red-400">데이터 로드 실패! 경로/형식을 확인하세요.</p>
      ) : (
        <>
          {/* CPU/GPU */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 w-full max-w-xl">
            <div className="flex-1 bg-gray-800/80 rounded-xl p-6">
              <h3 className="font-semibold mb-2">CPU 추천</h3>
              {cpu ? (
                <>
                  <p>
                    {cpu.model}{" "}
                    <span className="text-xs text-gray-400">(점수: {cpu.score})</span>
                  </p>
                  <ul className="mt-2 space-y-1">
                    {cpuLinks.map((l, i) => (
                      <li key={`${cpu.model}-${l.label}-${i}`}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          {l.label}: {l.price}원
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-red-400">추천 가능한 CPU가 없습니다.</p>
              )}
            </div>
            <div className="flex-1 bg-gray-800/80 rounded-xl p-6">
              <h3 className="font-semibold mb-2">
                GPU 추천 ({gpuBrand.toUpperCase()})
              </h3>
              {gpu ? (
                <>
                  <p>
                    {gpu.model}{" "}
                    <span className="text-xs text-gray-400">(점수: {gpu.score})</span>
                  </p>
                  <ul className="mt-2 space-y-1">
                    {gpuLinks.map((l, i) => (
                      <li key={`${gpu.model}-${l.label}-${i}`}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          {l.label}: {l.price}원
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-red-400">추천 가능한 GPU가 없습니다.</p>
              )}
            </div>
          </div>

          {/* 메인보드 추천 */}
          <div className="w-full max-w-xl bg-gray-800/80 rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-2">메인보드 추천</h3>
            {boardRecs.length === 0 ? (
              <p className="text-red-400">호환 가능한 메인보드가 없습니다.</p>
            ) : (
              boardRecs.map((b) => (
                <div key={b.model} className="mb-4">
                  <p className="font-bold">
                    {b.model}{" "}
                    <span className="text-xs text-gray-400">
                      [{b.chipset} | {b.memory}]
                    </span>
                  </p>
                  <ul className="mt-2 space-y-1">
                    {b.links.map((l, j) => (
                      <li key={`${b.model}-${l.label}-${j}`}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          {l.label}: {l.price}원
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* 램 추천 */}
          <div className="w-full max-w-xl bg-gray-800/80 rounded-xl p-6">
            <h3 className="font-semibold mb-2">램 추천</h3>
            {ramRecs.length === 0 ? (
              <p className="text-red-400">호환 가능한 램이 없습니다.</p>
            ) : (
              ramRecs.map((r, i) => (
                <div key={r.model} className="mb-4">
                  <p className="font-bold">
                    {r.model}{" "}
                    <span className="text-xs text-gray-400">
                      [{r.type}, {r.size_gb}GB]
                    </span>
                  </p>
                  <ul className="mt-2 space-y-1">
                    {r.links.map((l, j) => (
                      <li key={`${r.model}-${l.label}-${j}`}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          {l.label}: {l.price}원
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
