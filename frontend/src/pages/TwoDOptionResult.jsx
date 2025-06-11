import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackIcon from "../assets/iconIMG/previous.png";
import BulbIcon from "../assets/iconIMG/bulb.png";

// SSD 링크 매칭: model, type, capacity로 유연하게 탐색
function getLinks({ model, type, capacity }, danawaArr, bestArr, naverArr) {
  const normalized = s => s?.replace(/\s+/g, "").toLowerCase();
  function findByAll(arr) {
    // model 완전일치
    let found = arr.find((i) => normalized(i.model) === normalized(model));
    if (found) return found;
    // type + capacity 일치 (보조)
    return arr.find(
      (i) =>
        i.type?.toLowerCase() === type?.toLowerCase() &&
        (i.capacity + "").replace(/[^0-9]/g, "") === (capacity + "").replace(/[^0-9]/g, "")
    );
  }
  const danawa = findByAll(danawaArr);
  const best = findByAll(bestArr);
  const naver = findByAll(naverArr);

  return [
    danawa && danawa.url && { label: "다나와 최저가", url: danawa.url, price: Number(danawa.price) },
    best && best.url && { label: "리뷰 많은순", url: best.url, price: Number(best.price) },
    naver && naver.url && { label: "네이버 인기순", url: naver.url, price: Number(naver.price) }
  ].filter(Boolean);
}

export default function TwoDOptionResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [result, setResult] = useState(null);

  // 가격이 합리적인 범위만 추출
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
  // SSD: 256GB -> 500GB 이상 자동추천
  function findSSD(ssdArr, capacity) {
    let found = ssdArr.find(s => s.capacity === capacity);
    if (found) return found;
    const capacityNum = parseInt(capacity.replace(/[^0-9]/g, ""));
    const candidates = ssdArr
      .filter(s => parseInt(s.capacity) >= 500)
      .sort((a, b) => parseInt(a.capacity) - parseInt(b.capacity));
    return candidates[0] || null;
  }

  useEffect(() => {
    if (!state) {
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);

    async function fetchAndRecommend() {
      try {
        const [
          benchRaw,
          cpuRaw, gpuRaw, ramRaw, mbRaw, ssdRaw,
          cpuDanawa, cpuBest, cpuNaver,
          gpuDanawa, gpuBest, gpuNaver,
          ramDanawa, ramBest, ramNaver,
          mbDanawa, mbBest, mbNaver,
          ssdDanawa, ssdBest, ssdNaver
        ] = await Promise.all([
          fetch("./data/2d_recommend_db_2025.json").then(r => r.json()),
          fetch("./data/cpuDB.json").then(r => r.json()),
          fetch("./data/gpuDB.json").then(r => r.json()),
          fetch("./data/ramList.json").then(r => r.json()),
          Promise.all([
            fetch("./data/asus_mainboard.json").then(r => r.json()),
            fetch("./data/msi_mainboard.json").then(r => r.json()),
            fetch("./data/gigabyte_mainboard.json").then(r => r.json())
          ]).then(arr => arr.flat()),
          fetch("./data/ssd_type_list.json").then(r => r.json()),

          fetch("./data/cpu_danawa_price.json").then(r => r.json()),
          fetch("./data/cpu_danawa_best.json").then(r => r.json()),
          fetch("./data/cpu_naver_price.json").then(r => r.json()),

          fetch("./data/gpu_danawa_price.json").then(r => r.json()),
          fetch("./data/gpu_danawa_best.json").then(r => r.json()),
          fetch("./data/gpu_naver_price.json").then(r => r.json()),

          fetch("./data/ram_danawa_price.json").then(r => r.json()),
          fetch("./data/ram_danawa_best.json").then(r => r.json()),
          fetch("./data/ram_naver_price.json").then(r => r.json()),

          Promise.all([
            fetch("./data/asus_danawa_price.json").then(r => r.json()),
            fetch("./data/msi_danawa_price.json").then(r => r.json()),
            fetch("./data/gigabyte_danawa_price.json").then(r => r.json())
          ]).then(arr => arr.flat()),
          Promise.all([
            fetch("./data/asus_danawa_best.json").then(r => r.json()),
            fetch("./data/msi_danawa_best.json").then(r => r.json()),
            fetch("./data/gigabyte_danawa_best.json").then(r => r.json())
          ]).then(arr => arr.flat()),
          Promise.all([
            fetch("./data/asus_naver_price.json").then(r => r.json()),
            fetch("./data/msi_naver_price.json").then(r => r.json()),
            fetch("./data/gigabyte_naver_price.json").then(r => r.json())
          ]).then(arr => arr.flat()),

          fetch("./data/ssd_danawa_price.json").then(r => r.json()),
          fetch("./data/ssd_danawa_best.json").then(r => r.json()),
          fetch("./data/ssd_naver_price.json").then(r => r.json())
        ]);

        // 배열화
        const cpuArr = Array.isArray(cpuRaw) ? cpuRaw : cpuRaw.cpu || [];
        const gpuArr = Array.isArray(gpuRaw) ? gpuRaw : gpuRaw.gpu || [];
        const ramArr = Array.isArray(ramRaw) ? ramRaw : ramRaw.ram || ramRaw.list || [];
        const mbArr = Array.isArray(mbRaw) ? mbRaw : mbRaw.mainboard || mbRaw.mb || [];
        const ssdArr = Array.isArray(ssdRaw) ? ssdRaw : ssdRaw.ssd || [];

        // 1. 벤치에서 추천 조합 선택
        const { program, resolution, complexity } = state;
        const bench = benchRaw.find(
          b =>
            b.program === program &&
            b.resolution === resolution &&
            b.complexity === complexity
        );
        if (!bench) {
          setResult(null);
          setLoading(false);
          return;
        }

        // 2. CPU 추천
        function findCpuModel(target, cpuArr) {
          const models = target.split("/").map(s => s.trim());
          let found = null;
          for (const m of models) {
            found = cpuArr.find(
              c => c.model.toLowerCase().includes(m.toLowerCase())
            ) || found;
          }
          return found;
        }
        const cpu = findCpuModel(bench.cpu, cpuArr);

        // 3. GPU 추천
        function findGpuModel(target, gpuArr) {
          if (/내장/.test(target)) {
            return { model: "내장그래픽", score: "-", generation: "-", vram: "-" };
          }
          const base = target.replace(/ 이상|~.+/g, "");
          let found = gpuArr
            .filter(g => g.model.toLowerCase().includes(base.toLowerCase()))
            .sort((a, b) => (b.score || 0) - (a.score || 0))[0];
          if (!found && /~/.test(target)) {
            const [start, end] = target.split("~").map(s => s.trim());
            found = gpuArr
              .filter(
                g =>
                  g.model.toLowerCase().includes(start.toLowerCase()) ||
                  g.model.toLowerCase().includes(end.toLowerCase())
              )
              .sort((a, b) => (a.score || 0) - (b.score || 0))[0];
          }
          if (!found && /이상/.test(target)) {
            found = gpuArr
              .filter(g => /gtx|rtx|rx|quadro|firepro/i.test(g.model))
              .sort((a, b) => (a.score || 0) - (b.score || 0))[0];
          }
          return found;
        }
        const gpu = findGpuModel(bench.gpu, gpuArr);

        // 4. RAM 추천 (최대 3개, 최저가 기준)
        function findRamModels(target, ramArr, ramDanawa) {
          let size = 0;
          const match = /(\d+)(?:~(\d+))?GB/.exec(target);
          if (match) size = parseInt(match[1], 10);
          let found = ramArr.filter(r => r.size_gb === size);
          found = found.map(r => {
            const priceObj = ramDanawa.find(p => p.model === r.model);
            return { ...r, price: priceObj ? Number(priceObj.price) : Infinity, url: priceObj?.url };
          });
          const valid = filterValidPrices(found);
          return (valid.length > 0 ? valid : found).slice(0, 3);
        }
        const ramModels = findRamModels(bench.ram, ramArr, ramDanawa);

        // 5. SSD 추천
        let ssd = findSSD(ssdArr, (bench.ssd.match(/\d+GB/) || [])[0] || "500GB");

        // 6. 메인보드 추천 (브랜드별 1개씩)
        let mbModels = [];
        if (cpu) {
          const allBoards = mbArr.filter(
            m =>
              m.socket &&
              cpu.socket &&
              m.socket.toUpperCase() === cpu.socket.toUpperCase()
          );
          const brands = ["asus", "msi", "gigabyte"];
          mbModels = brands.map(brand => {
            const bList = allBoards.filter(b => b.model && new RegExp(brand, "i").test(b.model));
            if (bList.length === 0) return null;
            const merged = bList.map(b => {
              const priceObj = mbDanawa.find(p => p.model === b.model);
              return { ...b, price: priceObj ? Number(priceObj.price) : Infinity, url: priceObj?.url };
            });
            const valid = filterValidPrices(merged);
            return valid.length > 0 ? valid.sort((a, b) => a.price - b.price)[0] : merged[0];
          }).filter(Boolean);
        }

        // 가격/링크 정보
        const cpuLinks = cpu ? getLinks(cpu, cpuDanawa, cpuBest, cpuNaver) : [];
        const gpuLinks = gpu ? getLinks(gpu, gpuDanawa, gpuBest, gpuNaver) : [];
        const ramLinksArr = ramModels.map(r => getLinks(r, ramDanawa, ramBest, ramNaver));
        const mbLinksArr = mbModels.map(mb => getLinks(mb, mbDanawa, mbBest, mbNaver));
        const ssdLinks = ssd ? getLinks(ssd, ssdDanawa, ssdBest, ssdNaver) : [];

        // 총 견적(부품 1개씩 최저가 합산)
        function getFirstValidPrice(links) {
          return links && links[0] && links[0].price ? Number(links[0].price) : 0;
        }
        const totalPrice =
          getFirstValidPrice(cpuLinks) +
          getFirstValidPrice(gpuLinks) +
          getFirstValidPrice(ramLinksArr[0] || []) +
          getFirstValidPrice(mbLinksArr[0] || []) +
          getFirstValidPrice(ssdLinks);

        setResult({
          program,
          resolution,
          complexity,
          cpu,
          cpuLinks,
          gpu,
          gpuLinks,
          ramModels,
          ramLinksArr,
          mbModels,
          mbLinksArr,
          ssd,
          ssdLinks,
          totalPrice,
        });
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
        console.error("TwoDOptionResult fetch 에러:", err);
      }
    }
    fetchAndRecommend();
  }, [state]);

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">추천 결과</h2>
        <p className="text-red-400 text-lg font-bold text-center">
          추천 데이터가 전달되지 않았습니다.<br />
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
          2D 그래픽 사양 추천 결과
          <img src={BulbIcon} alt="bulb" className="w-7 h-7 ml-2" />
        </h2>
      </div>
      {loading ? (
        <p className="text-gray-400">로딩 중...</p>
      ) : error ? (
        <div className="text-red-400 font-bold text-center">
          추천 데이터/부품 정보 로드 실패! 데이터 경로/형식을 확인하세요.
        </div>
      ) : !result ? (
        <div className="text-red-400 font-bold text-center">
          선택한 옵션에 맞는 추천 데이터가 없습니다.
        </div>
      ) : (
        <>
          {/* 총합 견적 */}
          <div className="w-full max-w-xl bg-gray-900/70 rounded-xl p-6 mb-5 flex items-center justify-between border border-white/10">
            <span className="text-lg font-bold">총합 견적</span>
            <span className="text-2xl font-bold text-green-400">
              {result.totalPrice > 0
                ? result.totalPrice.toLocaleString() + " 원"
                : "계산 불가"}
            </span>
          </div>
          {/* 옵션 설명 */}
          <div className="w-full max-w-xl bg-gray-800/80 rounded-xl p-6 mb-6">
            <div>
              <span className="font-bold">프로그램:</span> {result.program}<br />
              <span className="font-bold">해상도:</span> {result.resolution}<br />
              <span className="font-bold">작업 복잡도:</span>{" "}
              {result.complexity === "low"
                ? "간단"
                : result.complexity === "medium"
                ? "보통"
                : "복잡"}
            </div>
          </div>
          {/* 부품별 추천 */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 w-full max-w-xl">
            {/* CPU */}
            <div className="flex-1 bg-gray-800/80 rounded-xl p-6">
              <h3 className="font-semibold mb-2">CPU 추천</h3>
              {result.cpu ? (
                <>
                  <p>
                    {result.cpu.model}
                    {result.cpu.generation && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({result.cpu.generation}세대)
                      </span>
                    )}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {result.cpuLinks.map((l, i) => (
                      <li key={i}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${l.label === "네이버 인기순" ? "text-green-500" : "text-blue-400"} underline`}
                        >
                          {l.label}: {Number(l.price).toLocaleString()}원
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-red-400">추천 CPU 없음</p>
              )}
            </div>
            {/* GPU */}
            <div className="flex-1 bg-gray-800/80 rounded-xl p-6">
              <h3 className="font-semibold mb-2">그래픽카드 추천</h3>
              {result.gpu ? (
                <>
                  <p>
                    {result.gpu.model}
                    {result.gpu.generation && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({result.gpu.generation}세대)
                      </span>
                    )}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {result.gpuLinks.map((l, i) => (
                      <li key={i}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${l.label === "네이버 인기순" ? "text-green-500" : "text-blue-400"} underline`}
                        >
                          {l.label}: {Number(l.price).toLocaleString()}원
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-red-400">추천 그래픽카드 없음</p>
              )}
            </div>
          </div>

          {/* 메인보드 추천 */}
          <div className="w-full max-w-xl bg-gray-800/80 rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-2">메인보드 추천</h3>
            {result.mbModels && result.mbModels.length > 0 ? (
              result.mbModels.map((b, i) => (
                <div key={b.model} className="mb-4">
                  <p className="font-bold">
                    {b.model}
                    {b.chipset && (
                      <span className="ml-2 text-xs text-gray-400">
                        [{b.chipset}]
                      </span>
                    )}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {result.mbLinksArr[i].map((l, j) => (
                      <li key={`${b.model}-${l.label}-${j}`}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${l.label === "네이버 인기순" ? "text-green-500" : "text-blue-400"} underline`}
                        >
                          {l.label}: {Number(l.price).toLocaleString()}원
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-red-400">호환 가능한 메인보드가 없습니다.</p>
            )}
          </div>

          {/* 램 추천 */}
          <div className="w-full max-w-xl bg-gray-800/80 rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-2">램 추천</h3>
            {result.ramModels && result.ramModels.length > 0 ? (
              result.ramModels.map((r, i) => (
                <div key={r.model} className="mb-4">
                  <p className="font-bold">
                    {r.model}
                    <span className="text-xs text-gray-400">
                      {" "}[{r.type}, {r.size_gb}GB]
                    </span>
                  </p>
                  <ul className="mt-2 space-y-1">
                    {result.ramLinksArr[i].map((l, j) => (
                      <li key={`${r.model}-${l.label}-${j}`}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${l.label === "네이버 인기순" ? "text-green-500" : "text-blue-400"} underline`}
                        >
                          {l.label}: {Number(l.price).toLocaleString()}원
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-red-400">호환 가능한 램이 없습니다.</p>
            )}
          </div>

          {/* SSD 추천 */}
          <div className="w-full max-w-xl bg-gray-800/80 rounded-xl p-6 mb-2">
            <h3 className="font-semibold mb-2">SSD 추천</h3>
            {result.ssd ? (
              <>
                <p className="font-bold">
                  {result.ssd.type} SSD ({result.ssd.capacity})
                </p>
                <ul className="mt-2 space-y-1">
                  {result.ssdLinks.length > 0 ? (
                    result.ssdLinks.map((l, i) => (
                      <li key={i}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${l.label === "네이버 인기순" ? "text-green-500" : "text-blue-400"} underline`}
                        >
                          {l.label}: {Number(l.price).toLocaleString()}원
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 text-xs">
                      ※ SSD는 가격 정보가 포함되어 있지 않습니다.
                    </li>
                  )}
                </ul>
              </>
            ) : (
              <p className="text-red-400">추천 SSD 없음</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
