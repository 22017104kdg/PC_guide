import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackIcon from "../assets/iconIMG/previous.png";
import BulbIcon from "../assets/iconIMG/bulb.png";

// 부품 링크 유틸 함수
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

    // 수정된 경로 함수: window.location.origin 사용
    const getUrl = (path) => `${window.location.origin}/data/json/${path}`;
    const fetchJson = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`파일 로드 실패: ${url}`);
      return await res.json();
    };

    async function fetchAndRecommend() {
      try {
        const [
          cpuRaw, gpuRaw, ramRaw, mbRaw, ssdRaw,
          cpuDanawa, cpuBest, cpuNaver,
          gpuDanawa, gpuBest, gpuNaver,
          ramDanawa, ramBest, ramNaver,
          mbDanawa, mbBest, mbNaver,
          ssdDanawa, ssdBest, ssdNaver
        ] = await Promise.all([
          fetchJson(getUrl("cpuDB.json")),
          fetchJson(getUrl("gpuDB.json")),
          fetchJson(getUrl("ramList.json")),
          Promise.all([
            fetchJson(getUrl("asus_mainboard.json")),
            fetchJson(getUrl("msi_mainboard.json")),
            fetchJson(getUrl("gigabyte_mainboard.json"))
          ]).then(arr => arr.flat()),
          fetchJson(getUrl("ssd_type_list.json")),

          fetchJson(getUrl("cpu_danawa_price.json")),
          fetchJson(getUrl("cpu_danawa_best.json")),
          fetchJson(getUrl("cpu_naver_price.json")),

          fetchJson(getUrl("gpu_danawa_price.json")),
          fetchJson(getUrl("gpu_danawa_best.json")),
          fetchJson(getUrl("gpu_naver_price.json")),

          fetchJson(getUrl("ram_danawa_price.json")),
          fetchJson(getUrl("ram_danawa_best.json")),
          fetchJson(getUrl("ram_naver_price.json")),

          Promise.all([
            fetchJson(getUrl("asus_danawa_price.json")),
            fetchJson(getUrl("msi_danawa_price.json")),
            fetchJson(getUrl("gigabyte_danawa_price.json"))
          ]).then(arr => arr.flat()),
          Promise.all([
            fetchJson(getUrl("asus_danawa_best.json")),
            fetchJson(getUrl("msi_danawa_best.json")),
            fetchJson(getUrl("gigabyte_danawa_best.json"))
          ]).then(arr => arr.flat()),
          Promise.all([
            fetchJson(getUrl("asus_naver_price.json")),
            fetchJson(getUrl("msi_naver_price.json")),
            fetchJson(getUrl("gigabyte_naver_price.json"))
          ]).then(arr => arr.flat()),

          fetchJson(getUrl("ssd_danawa_price.json")),
          fetchJson(getUrl("ssd_danawa_best.json")),
          fetchJson(getUrl("ssd_naver_price.json"))
        ]);

        const cpuArr = Array.isArray(cpuRaw) ? cpuRaw : cpuRaw.cpu || [];
        const gpuArr = Array.isArray(gpuRaw) ? gpuRaw : gpuRaw.gpu || [];
        const ramArr = Array.isArray(ramRaw) ? ramRaw : ramRaw.ram || ramRaw.list || [];
        const mbArr = Array.isArray(mbRaw) ? mbRaw : mbRaw.mainboard || mbRaw.mb || [];
        const ssdArr = Array.isArray(ssdRaw) ? ssdRaw : ssdRaw.ssd || [];

        const cpu = cpuArr[0] || null;
        const gpu = gpuArr[0] || null;
        const ramModels = ramArr.slice(0, 3);
        const mbModels = mbArr.filter(
          mb => cpu && mb.socket && cpu.socket && mb.socket.toUpperCase() === cpu.socket.toUpperCase()
        ).slice(0, 3);
        const ssd = ssdArr[0] || null;

        const cpuLinks = cpu ? getLinks(cpu, cpuDanawa, cpuBest, cpuNaver) : [];
        const gpuLinks = gpu ? getLinks(gpu, gpuDanawa, gpuBest, gpuNaver) : [];
        const ramLinksArr = ramModels.map(r => getLinks(r, ramDanawa, ramBest, ramNaver));
        const mbLinksArr = mbModels.map(mb => getLinks(mb, mbDanawa, mbBest, mbNaver));
        const ssdLinks = ssd ? getLinks(ssd, ssdDanawa, ssdBest, ssdNaver) : [];

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
    // eslint-disable-next-line
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
          <div className="w-full max-w-xl bg-gray-900/70 rounded-xl p-6 mb-5 flex items-center justify-between border border-white/10">
            <span className="text-lg font-bold">총합 견적</span>
            <span className="text-2xl font-bold text-green-400">
              {result.totalPrice > 0
                ? result.totalPrice.toLocaleString() + " 원"
                : "계산 불가"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-8 w-full max-w-xl">
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
                          className={`${
                            l.label === "네이버 인기순"
                              ? "text-green-500"
                              : "text-blue-400"
                          } underline`}
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
                          className={`${
                            l.label === "네이버 인기순"
                              ? "text-green-500"
                              : "text-blue-400"
                          } underline`}
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

          <div className="w-full max-w-xl bg-gray-800/80 rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-2">메인보드 추천</h3>
            {result.mbModels && result.mbModels.length > 0 ? (
              result.mbModels.map((b, i) => (
                <div key={b.model} className="mb-4">
                  <p className="font-bold">
                    {b.model}
                    {b.chipset && (
                      <span className="ml-2 text-xs text-gray-400">[{b.chipset}]</span>
                    )}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {result.mbLinksArr[i].map((l, j) => (
                      <li key={`${b.model}-${l.label}-${j}`}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${
                            l.label === "네이버 인기순"
                              ? "text-green-500"
                              : "text-blue-400"
                          } underline`}
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

          <div className="w-full max-w-xl bg-gray-800/80 rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-2">램 추천</h3>
            {result.ramModels && result.ramModels.length > 0 ? (
              result.ramModels.map((r, i) => (
                <div key={r.model} className="mb-4">
                  <p className="font-bold">
                    {r.model}
                    <span className="text-xs text-gray-400">
                      {" "}
                      [{r.type}, {r.size_gb}GB]
                    </span>
                  </p>
                  <ul className="mt-2 space-y-1">
                    {result.ramLinksArr[i].map((l, j) => (
                      <li key={`${r.model}-${l.label}-${j}`}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${
                            l.label === "네이버 인기순"
                              ? "text-green-500"
                              : "text-blue-400"
                          } underline`}
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
                          className={`${
                            l.label === "네이버 인기순"
                              ? "text-green-500"
                              : "text-blue-400"
                          } underline`}
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
