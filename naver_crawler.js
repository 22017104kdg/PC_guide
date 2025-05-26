const fs = require('fs').promises;
// 최신 node-fetch는 ESM이므로 CommonJS에서 require로 쓸 땐 아래처럼!
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 네이버 개발자센터에서 발급받은 ID/Secret 입력
const clientId = 'kbYKrsf4oiPN7pOKGTYn';
const clientSecret = 'otZzFOKmAZ';

// 네이버 쇼핑 검색 API 함수
async function getNaverShoppingResult(query) {
  const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=1&sort=sim`;
  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret
    }
  });
  if (!res.ok) {
    console.error('네이버 API 요청 실패:', res.status, res.statusText);
    return { price: "검색불가", url: "" };
  }
  const data = await res.json();
  if (data.items && data.items.length > 0) {
    // 첫 번째 상품(정렬 옵션에 따라 다름)
    const item = data.items[0];
    return {
      title: item.title.replace(/<[^>]+>/g, ''), // HTML 태그 제거
      price: item.lprice,
      url: item.link
    };
  }
  return { price: "검색불가", url: "" };
}

// 부품 리스트 읽기
async function readPartsJson(filename) {
  const data = await fs.readFile(filename, 'utf-8');
  const json = JSON.parse(data);
  if (Array.isArray(json)) return json;
  if (json.cpu && Array.isArray(json.cpu)) return json.cpu;
  if (json.gpu && Array.isArray(json.gpu)) return json.gpu;
  return [];
}

// 실행 함수
async function crawlAndSave(partsFilename, outputFilename) {
  const parts = await readPartsJson(partsFilename);
  const resultList = [];
  for (const part of parts) {
    const res = await getNaverShoppingResult(part.model);
    resultList.push({
      model: part.model,
      price: res.price,
      url: res.url,
    });
    console.log(`[${outputFilename}] ${part.model} => ${res.price}원`);
    // 네이버 API 쿼터 초과 방지(필수)
    await new Promise(r => setTimeout(r, 1000));
  }
  await fs.writeFile(outputFilename, JSON.stringify(resultList, null, 2));
  console.log(`✅ ${outputFilename} 저장 완료!`);
}

async function crawlAll() {
  await crawlAndSave('./frontend/public/data/cpuDB.json', './frontend/public/data/cpu_naver_price.json');
  await crawlAndSave('./frontend/public/data/gpuDB.json', './frontend/public/data/gpu_naver_price.json');
}

crawlAll();
