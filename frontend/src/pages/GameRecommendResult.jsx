import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackIcon from "../assets/iconIMG/previous.png";
import BulbIcon from "../assets/iconIMG/bulb.png";
import NvidiaIcon from "../assets/iconIMG/nvidia.png";
import AmdIcon from "../assets/iconIMG/amd.png";

export default function GameRecommendResult() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">추천 결과</h2>
        <p className="text-red-400 text-lg font-bold text-center">
          추천 데이터가 전달되지 않았습니다.
          <br />
          <span className="text-sm text-gray-400">
            이전 단계에서 정상적으로 추천을 받아주세요.
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

  const { cpu_score, gpu_score, name, level } = location.state;

  // --- DB 상태 ---
  const [cpuDB, setCpuDB] = useState([]);
  const [gpuDB, setGpuDB] = useState([]);
  const [mainboardDB, setMainboardDB] = useState([]);
  const [ramDB, setRamDB] = useState([]);

  // --- 가격/URL 상태 ---
  const [cpuDanawaPrice, setCpuDanawaPrice] = useState([]);
  const [cpuDanawaBest, setCpuDanawaBest] = useState([]);
  const [cpuNaverPrice, setCpuNaverPrice] = useState([]);

  const [gpuDanawaPrice, setGpuDanawaPrice] = useState([]);
  const [gpuDanawaBest, setGpuDanawaBest] = useState([]);
  const [gpuNaverPrice, setGpuNaverPrice] = useState([]);

  const [mbDanawaPrice, setMbDanawaPrice] = useState([]);
  const [mbDanawaBest, setMbDanawaBest] = useState([]);
  const [mbNaverPrice, setMbNaverPrice] = useState([]);

  const [ramDanawaPrice, setRamDanawaPrice] = useState([]);
  const [ramDanawaBest, setRamDanawaBest] = useState([]);
  const [ramNaverPrice, setRamNaverPrice] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [gpuBrand, setGpuBrand] = useState("any");

  // ---------- 데이터 로드 ----------
  useEffect(() => {
    async function loadData() {
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

          // asus + msi + gigabyte 합치기
          Promise.all([
            fetch("/data/asus_mainboard.json").then(r => r.json()),
            fetch("/data/msi_mainboard.json").then(r => r.json()),
            fetch("/data/gigabyte_mainboard.json").then(r => r.json()),
          ]).then(arr => arr.flat()),

          Promise.all([
            fetch("/data/asus_danawa_price.json").then(r => r.json()),
            fetch("/data/msi_danawa_price.json").then(r => r.json()),
            fetch("/data/gigabyte_danawa_price.json").then(r => r.json()),
          ]).then(arr => arr.flat()),
          Promise.all([
            fetch("/data/asus_danawa_best.json").then(r => r.json()),
            fetch("/data/msi_danawa_best.json").then(r => r.json()),
            fetch("/data/gigabyte_danawa_best.json").then(r => r.json()),
          ]).then(arr => arr.flat()),
          Promise.all([
            fetch("/data/asus_naver_price.json").then(r => r.json()),
            fetch("/data/msi_naver_price.json").then(r => r.json()),
            fetch("/data/gigabyte_naver_price.json").then(r => r.json()),
          ]).then(arr => arr.flat()),

          fetch("/data/ramList.json").then(r => r.json()),
          fetch("/data/ram_danawa_price.json").then(r => r.json()),
          fetch("/data/ram_danawa_best.json").then(r => r.json()),
          fetch("/data/ram_naver_price.json").then(r => r.json()),
        ]);

        setCpuDB(Array.isArray(cpuRes) ? cpuRes : cpuRes.cpu || []);
        setGpuDB(Array.isArray(gpuRes) ? gpuRes : gpuRes.gpu || []);

        setCpuDanawaPrice(cpuDP);
        setCpuDanawaBest(cpuDBest);
        setCpuNaverPrice(cpuNP);

        setGpuDanawaPrice(gpuDP);
        setGpuDanawaBest(gpuDBest);
        setGpuNaverPrice(gpuNP);

        setMainboardDB(mbAll);
        setMbDanawaPrice(mbDP);
        setMbDanawaBest(mbDBest);
        setMbNaverPrice(mbNP);

        setRamDB(ramList);
        setRamDanawaPrice(ramDP);
        setRamDanawaBest(ramDBest);
        setRamNaverPrice(ramNP);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setFetchError(true);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ---------- 유틸 함수 ----------
  function getProductLinks(model, dp, db, np) {
    const p = dp.find(i => i.model === model) || {};
    const b = db.find(i => i.model === model) || {};
    const n = np.find(i => i.model === model) || {};
    return [
      p.url && { label: "다나와 최저가", url: p.url, price: Number(p.price) },
      b.url && { label: "리뷰 많은순", url: b.url, price: Number(b.price) },
      n.url && { label: "네이버 인기순", url: n.url, price: Number(n.price) },
    ].filter(Boolean);
  }

  // 비정상적으로 비싼(단종/프리미엄) 제품 배제
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

  // ---------- 부품 추천 ----------

  // CPU 추천
  function findBestCPU(db, score) {
    let cands = db.filter(i => Number(i.score) >= score);
    cands = cands.map(cpu => {
      const priceObj = cpuDanawaPrice.find(p => p.model === cpu.model);
      return { ...cpu, price: priceObj ? Number(priceObj.price) : Infinity, url: priceObj?.url };
    });
    const valid = filterValidPrices(cands);
    return valid.length > 0 ? valid.sort((a, b) => a.price - b.price)[0] : cands[0] || null;
  }
  // GPU 추천 (브랜드 필터 적용)
  function findBestGPU(db, score, brand = "any") {
    let cands = db.filter(i => Number(i.score) >= score);
    if (brand !== "any") {
      const re = brand === "nvidia" ? /(nvidia|rtx|gtx)/i : /(amd|radeon)/i;
      cands = cands.filter(i => re.test(i.model));
    }
    cands = cands.map(gpu => {
      const priceObj = gpuDanawaPrice.find(p => p.model === gpu.model);
      return { ...gpu, price: priceObj ? Number(priceObj.price) : Infinity, url: priceObj?.url };
    });
    const valid = filterValidPrices(cands);
    return valid.length > 0 ? valid.sort((a, b) => a.price - b.price)[0] : cands[0] || null;
  }

  // 브랜드별 메인보드 추천 (각 브랜드 최저가 1개씩)
  function findBestMainboards(cpu) {
    if (!cpu) return [];
    const boards = mainboardDB.filter(
      mb => mb.socket?.toUpperCase() === cpu.socket?.toUpperCase()
    );
    // 브랜드별 추천 (ASUS, MSI, GIGABYTE)
    const brands = ["asus", "msi", "gigabyte"];
    return brands.map(brand => {
      const bList = boards.filter(b => b.model && new RegExp(brand, "i").test(b.model));
      if (bList.length === 0) return null;
      // 가격정보 병합
      const merged = bList.map(b => {
        const priceObj = mbDanawaPrice.find(p => p.model === b.model);
        return { ...b, price: priceObj ? Number(priceObj.price) : Infinity, url: priceObj?.url };
      });
      const valid = filterValidPrices(merged);
      return valid.length > 0 ? valid.sort((a, b) => a.price - b.price)[0] : merged[0];
    }).filter(Boolean);
  }

  // 램 추천 (보드 메모리 타입, 16GB/32GB)
  function findBestRams(memType, size = 16) {
    let cands = ramDB.filter(r => r.type?.toUpperCase() === memType && r.size_gb === size);
    cands = cands.map(r => {
      const priceObj = ramDanawaPrice.find(p => p.model === r.model);
      return { ...r, price: priceObj ? Number(priceObj.price) : Infinity, url: priceObj?.url };
    });
    const valid = filterValidPrices(cands);
    return valid.length > 0 ? valid.slice(0, 3) : cands.slice(0, 3);
  }

  // ---------- 추천 실행 ----------
  let cpu, gpu, cpuLinks, gpuLinks, boardRecommendations = [], ramRecommendations = [], totalPrice = 0;

  if (!loading && !fetchError) {
    cpu = findBestCPU(cpuDB, cpu_score);
    gpu = findBestGPU(gpuDB, gpu_score, gpuBrand);

    cpuLinks = cpu
      ? getProductLinks(cpu.model, cpuDanawaPrice, cpuDanawaBest, cpuNaverPrice)
      : [];
    gpuLinks = gpu
      ? getProductLinks(gpu.model, gpuDanawaPrice, gpuDanawaBest, gpuNaverPrice)
      : [];

    boardRecommendations = findBestMainboards(cpu);

    // 메모리 타입 결정 (첫 메인보드 기준)
    const memType = boardRecommendations[0]?.memory?.toUpperCase() || "DDR4";
    // 게임 최소/권장에 따라 램 크기 조절 (16GB/32GB 등)
    const ramTarget = memType === "DDR5" ? 32 : 16;
    ramRecommendations = findBestRams(memType, ramTarget);

    // 총합 계산 (cpu, gpu, 메인보드, 램 중 가장 저렴한 가격만 합산)
    const prices = [
      cpuLinks[0]?.price || cpu?.price || 0,
      gpuLinks[0]?.price || gpu?.price || 0,
      ...boardRecommendations.map(b => b.price || 0).slice(0, 1), // 브랜드별 1개만
      ramRecommendations[0]?.price || 0,
    ].map(Number).filter(x => x !== Infinity && !isNaN(x) && x > 0);

    totalPrice = prices.reduce((sum, v) => sum + v, 0);
  }

  // ---------- 렌더링 ----------
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
          {name
            ? `${name} ${level === "minimum" ? "최소" : "권장"} 사양 추천 결과`
            : "추천 결과"}
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

      {/* 로딩 / 에러 */}
      {loading ? (
        <p className="text-gray-400">로딩 중...</p>
      ) : fetchError ? (
        <p className="text-red-400">데이터 로드 실패! 경로/포맷 확인하세요.</p>
      ) : (
        <>
          {/* 총합 */}
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
                    <span className="text-xs text-gray-400">
                      (점수: {cpu.score})
                    </span>
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
                    <span className="text-xs text-gray-400">
                      (점수: {gpu.score})
                    </span>
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
            {boardRecommendations.length === 0 ? (
              <p className="text-red-400">호환 가능한 메인보드가 없습니다.</p>
            ) : (
              boardRecommendations.map((b) => {
                // 이 부분에서 다나와/리뷰/네이버 url 한 번에 표시
                const mbLinks = getProductLinks(b.model, mbDanawaPrice, mbDanawaBest, mbNaverPrice);
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
            {ramRecommendations.length === 0 ? (
              <p className="text-red-400">호환 가능한 램이 없습니다.</p>
            ) : (
              ramRecommendations.map((r, i) => {
                const ramLinks = getProductLinks(r.model, ramDanawaPrice, ramDanawaBest, ramNaverPrice);
                return (
                  <div key={r.model} className="mb-4">
                    <p className="font-bold">
                      {r.model}{" "}
                      <span className="text-xs text-gray-400">
                        [{r.type}, {r.size_gb}GB]
                      </span>
                    </p>
                    <ul className="mt-2 space-y-1">
                      {ramLinks.map((l, j) => (
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
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
