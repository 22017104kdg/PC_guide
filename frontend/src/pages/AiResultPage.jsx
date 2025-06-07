import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackIcon from "../assets/iconIMG/previous.png";
import BulbIcon from "../assets/iconIMG/bulb.png";

// 부품 링크 유틸 함수 (주신 내용 활용)
function getLinks({ model, type, capacity }, danawaArr, bestArr, naverArr) {
  const normalized = s => s?.replace(/\s+/g, "").toLowerCase();

  function findByAll(arr) {
    let found = arr.find(i => normalized(i.model) === normalized(model));
    if (found) return found;
    return arr.find(
      i =>
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

// 합리적 가격 필터 (주신 코드)
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

export default function AiResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [result, setResult] = useState(null);

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
        // 여기에 실제 부품 DB JSON 경로 넣으세요
        const [
          cpuRaw, gpuRaw, ramRaw, mbRaw, ssdRaw,
          cpuDanawa, cpuBest, cpuNaver,
          gpuDanawa, gpuBest, gpuNaver,
          ramDanawa, ramBest, ramNaver,
          mbDanawa, mbBest, mbNaver,
          ssdDanawa, ssdBest, ssdNaver
        ] = await Promise.all([
          fetch("/data/cpuDB.json").then(r => r.json()),
          fetch("/data/gpuDB.json").then(r => r.json()),
          fetch("/data/ramList.json").then(r => r.json()),
          Promise.all([
            fetch("/data/asus_mainboard.json").then(r => r.json()),
            fetch("/data/msi_mainboard.json").then(r => r.json()),
            fetch("/data/gigabyte_mainboard.json").then(r => r.json())
          ]).then(arr => arr.flat()),
          fetch("/data/ssd_type_list.json").then(r => r.json()),

          fetch("/data/cpu_danawa_price.json").then(r => r.json()),
          fetch("/data/cpu_danawa_best.json").then(r => r.json()),
          fetch("/data/cpu_naver_price.json").then(r => r.json()),

          fetch("/data/gpu_danawa_price.json").then(r => r.json()),
          fetch("/data/gpu_danawa_best.json").then(r => r.json()),
          fetch("/data/gpu_naver_price.json").then(r => r.json()),

          fetch("/data/ram_danawa_price.json").then(r => r.json()),
          fetch("/data/ram_danawa_best.json").then(r => r.json()),
          fetch("/data/ram_naver_price.json").then(r => r.json()),

          Promise.all([
            fetch("/data/asus_danawa_price.json").then(r => r.json()),
            fetch("/data/msi_danawa_price.json").then(r => r.json()),
            fetch("/data/gigabyte_danawa_price.json").then(r => r.json())
          ]).then(arr => arr.flat()),
          Promise.all([
            fetch("/data/asus_danawa_best.json").then(r => r.json()),
            fetch("/data/msi_danawa_best.json").then(r => r.json()),
            fetch("/data/gigabyte_danawa_best.json").then(r => r.json())
          ]).then(arr => arr.flat()),
          Promise.all([
            fetch("/data/asus_naver_price.json").then(r => r.json()),
            fetch("/data/msi_naver_price.json").then(r => r.json()),
            fetch("/data/gigabyte_naver_price.json").then(r => r.json())
          ]).then(arr => arr.flat()),

          fetch("/data/ssd_danawa_price.json").then(r => r.json()),
          fetch("/data/ssd_danawa_best.json").then(r => r.json()),
          fetch("/data/ssd_naver_price.json").then(r => r.json())
        ]);

        // 배열화
        const cpuArr = Array.isArray(cpuRaw) ? cpuRaw : cpuRaw.cpu || [];
        const gpuArr = Array.isArray(gpuRaw) ? gpuRaw : gpuRaw.gpu || [];
        const ramArr = Array.isArray(ramRaw) ? ramRaw : ramRaw.ram || ramRaw.list || [];
        const mbArr = Array.isArray(mbRaw) ? mbRaw : mbRaw.mainboard || mbRaw.mb || [];
        const ssdArr = Array.isArray(ssdRaw) ? ssdRaw : ssdRaw.ssd || [];

        // 여기서는 state에 간단히 model, mode, stage 정보만 있으므로
        // 아래는 임의 추천 로직(실사용 데이터로 변경하세요)
        // 실제 AI 작업용 사양 DB를 연동해서 조건별 추천해야 함

        // 예) CPU 추천 (가장 성능 좋은 CPU 1개)
        const cpu = cpuArr[0] || null;

        // GPU 추천 (가장 성능 좋은 GPU 1개)
        const gpu = gpuArr[0] || null;

        // RAM 추천 (3개까지)
        const ramModels = ramArr.slice(0, 3);

        // 메인보드 추천 (CPU 소켓에 맞는 보드)
        const mbModels = mbArr.filter(
          mb => cpu && mb.socket && cpu.socket && mb.socket.toUpperCase() === cpu.socket.toUpperCase()
        ).slice(0, 3);

        // SSD 추천 (가장 작은 용량 SSD 1개)
        const ssd = ssdArr[0] || null;

        // 링크 생성
        const cpuLinks = cpu ? getLinks(cpu, cpuDanawa, cpuBest, cpuNaver) : [];
        const gpuLinks = gpu ? getLinks(gpu, gpuDanawa, gpuBest, gpuNaver) : [];
        const ramLinksArr = ramModels.map(r => getLinks(r, ramDanawa, ramBest, ramNaver));
        const mbLinksArr = mbModels.map(mb => getLinks(mb, mbDanawa, mbBest, mbNaver));
        const ssdLinks = ssd ? getLinks(ssd, ssdDanawa, ssdBest, ssdNaver) : [];

        // 총 가격 계산 (1개당 최저가 기준)
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
          totalPrice
        });
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
        console.error("AiResultPage fetch 에러:", err);
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
          AI 작업 사양 추천 결과
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

          {/* 부품별 추천 UI */}
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
                          className={`${l.label === "네이버 인기순"
                            ? "text-green-500"
                            : "text-blue-400"} underline`}
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
                          className={`${l.label === "네이버 인기순"
                            ? "text-green-500"
                            : "text-blue-400"} underline`}
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
                          className={`${l.label === "네이버 인기순"
                            ? "text-green-500"
                            : "text-blue-400"} underline`}
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
                          className={`${l.label === "네이버 인기순"
                            ? "text-green-500"
                            : "text-blue-400"} underline`}
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
                          className={`${l.label === "네이버 인기순"
                            ? "text-green-500"
                            : "text-blue-400"} underline`}
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
