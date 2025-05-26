const fs = require('fs').promises;
// 최신 node-fetch는 ESM이므로 CommonJS에서 require로 쓸 땐 아래처럼!
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 네이버 개발자센터에서 발급받은 ID/Secret 입력 (본인 값 사용)
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

// RAM 리스트 읽기
async function readRamJson(filename) {
  const data = await fs.readFile(filename, 'utf-8');
  return JSON.parse(data);
}

// 실행 함수
async function crawlAndSave(partsFilename, outputFilename) {
  const ramList = await readRamJson(partsFilename);
  const resultList = [];
  for (const ram of ramList) {
    const res = await getNaverShoppingResult(ram.model);
    resultList.push({
      model: ram.model,
      type: ram.type,
      size_gb: ram.size_gb,
      brand: ram.brand,
      price: res.price,
      url: res.url,
      title: res.title || ram.model
    });
    console.log(`[${outputFilename}] ${ram.model} => ${res.price}원`);
    // 네이버 API 쿼터 초과 방지(필수)
    await new Promise(r => setTimeout(r, 1100));
  }
  await fs.writeFile(outputFilename, JSON.stringify(resultList, null, 2));
  console.log(`✅ ${outputFilename} 저장 완료!`);
}

async function crawlAll() {
  // 경로는 프로젝트 구조에 따라 수정!
  await crawlAndSave('./frontend/public/data/ramList.json', './frontend/public/data/ram_naver_price.json');
}

crawlAll();
