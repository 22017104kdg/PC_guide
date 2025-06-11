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
  const [cpuBest, setCpuBest] = useState([]);
  const [cpuNaver, setCpuNaver] = useState([]);

  const [gpuDanawa, setGpuDanawa] = useState([]);
  const [gpuBest, setGpuBest] = useState([]);
  const [gpuNaver, setGpuNaver] = useState([]);

  const [mbDanawa, setMbDanawa] = useState([]);
  const [mbBest, setMbBest] = useState([]);
  const [mbNaver, setMbNaver] = useState([]);

  const [ramDanawa, setRamDanawa] = useState([]);
  const [ramBest, setRamBest] = useState([]);
  const [ramNaver, setRamNaver] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [gpuBrand, setGpuBrand] = useState("any");

  // -------- 유틸 함수 --------
  function getLinks(model, dp, db, np) {
    const p = dp.find(i => i.model === model) || {};
    const b = db.find(i => i.model === model) || {};
    const n = np.find(i => i.model === model) || {};
    return [
      p.url && { label: "다나와 최저가", url: p.url, price: Number(p.price) },
      b.url && { label: "리뷰 많은순", url: b.url, price: Number(b.price) },
      n.url && { label: "네이버 인기순", url: n.url, price: Number(n.price) },
    ].filter(Boolean);
  }
  // 단종/고가 배제
  function filterValidPrices(arr, field = "price") {
    const nums = arr.map(x => Number(x[field])).filter(x => x > 0).sort((a, b) => a - b);
    if (nums.length === 0) return [];
    const base = nums[0];
    return arr.filter(x =>
      !!x[field] &&
      !isNaN(Number(x[field])) &&
      Number(x[field]) <= base * 2.5
    );
  }
  // GPU 브랜드 필터
  function filterGpu(list, brand) {
    if (brand === "any") return list;
    const re = brand === "nvidia"
      ? /(nvidia|rtx|gtx)/i
      : /(amd|radeon)/i;
    return list.filter(i => re.test(i.model));
  }
  // 점수 기준 최적 파트 찾기(최저가)
  function findBestPart(db, score, brand = "any", dp = []) {
    let candidates = db.filter(i => Number(i.score) >= score);
    if (db === gpuDB) candidates = filterGpu(candidates, brand);
    candidates = candidates.map(part => {
      const priceObj = dp.find(p => p.model === part.model);
      return { ...part, price: priceObj ? Number(priceObj.price) : Infinity, url: priceObj?.url };
    });
    const valid = filterValidPrices(candidates);
    return valid.length > 0 ? valid.sort((a, b) => a.price - b.price)[0] : candidates[0] || null;
  }

  // 데이터 로드
  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        setFetchError(false);
        const base = "/PC_guide/data";
        const [
          cpuRes, gpuRes,
          cpuDP, cpuDBest, cpuNP,
          gpuDP, gpuDBest, gpuNP,
          mbAll, mbDP, mbDBest, mbNP,
          ramList, ramDP, ramDBest, ramNP
        ] = await Promise.all([
          fetch(`${base}/cpuDB.json`).then(r => r.json()),
          fetch(`${base}/gpuDB.json`).then(r => r.json()),

          fetch(`${base}/cpu_danawa_price.json`).then(r => r.json()),
          fetch(`${base}/cpu_danawa_best.json`).then(r => r.json()),
          fetch(`${base}/cpu_naver_price.json`).then(r => r.json()),

          fetch(`${base}/gpu_danawa_price.json`).then(r => r.json()),
          fetch(`${base}/gpu_danawa_best.json`).then(r => r.json()),
          fetch(`${base}/gpu_naver_price.json`).then(r => r.json()),

          // asus + msi + gigabyte 메인보드 합치기
          Promise.all([
            fetch(`${base}/asus_mainboard.json`).then(r => r.json()),
            fetch(`${base}/msi_mainboard.json`).then(r => r.json()),
            fetch(`${base}/gigabyte_mainboard.json`).then(r => r.json()),
          ]).then(arr => arr.flat()),

          Promise.all([
            fetch(`${base}/asus_danawa_price.json`).then(r=>r.json()),
            fetch(`${base}/msi_danawa_price.json`).then(r=>r.json()),
            fetch(`${base}/gigabyte_danawa_price.json`).then(r=>r.json()),
          ]).then(arr => arr.flat()),
          Promise.all([
            fetch(`${base}/asus_danawa_best.json`).then(r=>r.json()),
            fetch(`${base}/msi_danawa_best.json`).then(r=>r.json()),
            fetch(`${base}/gigabyte_danawa_best.json`).then(r=>r.json()),
          ]).then(arr => arr.flat()),
          Promise.all([
            fetch(`${base}/asus_naver_price.json`).then(r=>r.json()),
            fetch(`${base}/msi_naver_price.json`).then(r=>r.json()),
            fetch(`${base}/gigabyte_naver_price.json`).then(r=>r.json()),
          ]).then(arr => arr.flat()),

          fetch(`${base}/ramList.json`).then(r=>r.json()),
          fetch(`${base}/ram_danawa_price.json`).then(r=>r.json()),
          fetch(`${base}/ram_danawa_best.json`).then(r=>r.json()),
          fetch(`${base}/ram_naver_price.json`).then(r=>r.json()),
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

  // ---- 추천 결과 계산 ----
  let cpu, cpuLinks, gpu, gpuLinks, boardRecs = [], ramRecs = [], totalPrice = 0;
  if (!loading && !fetchError) {
    cpu = findBestPart(cpuDB, cpu_score, "any", cpuDanawa);
    gpu = findBestPart(gpuDB, gpu_score, gpuBrand, gpuDanawa);

    cpuLinks = cpu ? getLinks(cpu.model, cpuDanawa, cpuBest, cpuNaver) : [];
    gpuLinks = gpu ? getLinks(gpu.model, gpuDanawa, gpuBest, gpuNaver) : [];

    // 메인보드 추천 (브랜드별 1개씩)
    const allBoards = cpu
      ? mainboardDB.filter(mb => mb.socket?.toUpperCase() === cpu.socket?.toUpperCase())
      : [];
    const brands = ["asus", "msi", "gigabyte"];
    boardRecs = brands.map(brand => {
      const bList = allBoards.filter(b => b.model && new RegExp(brand, "i").test(b.model));
      if (bList.length === 0) return null;
      const merged = bList.map(b => {
        const priceObj = mbDanawa.find(p => p.model === b.model);
        return { ...b, price: priceObj ? Number(priceObj.price) : Infinity, url: priceObj?.url };
      });
      const valid = filterValidPrices(merged);
      return valid.length > 0 ? valid.sort((a, b) => a.price - b.price)[0] : merged[0];
    }).filter(Boolean);

    // 램 추천 (첫 보드 기준 최대 3개)
    const memType = boardRecs[0]?.memory?.toUpperCase() || "DDR4";
    const sizeGb = memType === "DDR5" ? 32 : 16;
    ramRecs = ramDB
      .filter(r => r.type?.toUpperCase() === memType && r.size_gb === sizeGb)
      .map(r => {
        const priceObj = ramDanawa.find(p => p.model === r.model);
        return { ...r, price: priceObj ? Number(priceObj.price) : Infinity, url: priceObj?.url };
      });
    const validRams = filterValidPrices(ramRecs);
    ramRecs = (validRams.length > 0 ? validRams : ramRecs).slice(0, 3).map(r => ({
      ...r,
      links: getLinks(r.model, ramDanawa, ramBest, ramNaver)
    }));

    // 총합 계산 (cpu, gpu, 메인보드 중 1개, 램 1개)
    const prices = [
      cpuLinks[0]?.price || cpu?.price || 0,
      gpuLinks[0]?.price || gpu?.price || 0,
      boardRecs[0]?.price || 0,
      ramRecs[0]?.price || 0,
    ].map(Number).filter(x => x !== Infinity && !isNaN(x) && x > 0);

    totalPrice = prices.reduce((sum, v) => sum + v, 0);
  }

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
          {/* 총합 견적 */}
          <div className="w-full max-w-xl bg-gray-900/70 rounded-xl p-6 mb-5 flex items-center justify-between border border-white/10">
            <span className="text-lg font-bold">총합 견적</span>
            <span className="text-2xl font-bold text-green-400">
              {totalPrice > 0 ? totalPrice.toLocaleString() + " 원" : "계산 불가"}
            </span>
          </div>

          {/* CPU/GPU */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 w-full max-w-xl">
            {/* CPU */}
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
                          className={`${l.label === "네이버 인기순" ? "text-green-500" : "text-blue-400"} underline`}
                        >
                          {l.label}: {l.price?.toLocaleString()}원
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-red-400">추천 가능한 CPU가 없습니다.</p>
              )}
            </div>
            {/* GPU */}
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
                          className={`${l.label === "네이버 인기순" ? "text-green-500" : "text-blue-400"} underline`}
                        >
                          {l.label}: {l.price?.toLocaleString()}원
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
              boardRecs.map((b) => {
                const mbLinks = getLinks(b.model, mbDanawa, mbBest, mbNaver);
                return (
                  <div key={b.model} className="mb-4">
                    <p className="font-bold">
                      {b.model}{" "}
                      <span className="text-xs text-gray-400">
                        [{b.chipset} | {b.memory}]
                      </span>
                    </p>
                    <ul className="mt-2 space-y-1">
                      {mbLinks.map((l, j) => (
                        <li key={`${b.model}-${l.label}-${j}`}>
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${l.label === "네이버 인기순" ? "text-green-500" : "text-blue-400"} underline`}
                          >
                            {l.label}: {l.price?.toLocaleString()}원
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
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
                          className={`${l.label === "네이버 인기순" ? "text-green-500" : "text-blue-400"} underline`}
                        >
                          {l.label}: {l.price?.toLocaleString()}원
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
