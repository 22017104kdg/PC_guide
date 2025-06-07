// ssd_naver_price.js
const fs = require('fs').promises;
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 네이버 개발자센터에서 발급받은 ID/Secret 입력!
const clientId = 'kbYKrsf4oiPN7pOKGTYn';
const clientSecret = 'otZzFOKmAZ';

// SSD 검색어 자동 생성 함수
function makeSsdQuery(ssd) {
  if (ssd.type === "NVMe") return `NVMe SSD ${ssd.capacity}`;
  if (ssd.type === "TLC")  return `TLC SSD ${ssd.capacity}`;
  if (ssd.type === "SATA") return `SATA SSD ${ssd.capacity}`;
  return `${ssd.type} SSD ${ssd.capacity}`;
}

// 네이버 쇼핑 API 요청 함수
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
    const item = data.items[0];
    return {
      title: item.title.replace(/<[^>]+>/g, ''),
      price: item.lprice,
      url: item.link
    };
  }
  return { price: "검색불가", url: "" };
}

// SSD 리스트 파일 읽기
async function readSsdJson(filename) {
  const data = await fs.readFile(filename, 'utf-8');
  return JSON.parse(data);
}

// 크롤링 및 저장 함수
async function crawlAndSave(partsFilename, outputFilename) {
  const ssdList = await readSsdJson(partsFilename);
  const resultList = [];
  for (const ssd of ssdList) {
    const query = makeSsdQuery(ssd);
    const res = await getNaverShoppingResult(query);
    resultList.push({
      model: `${ssd.type} SSD ${ssd.capacity}`,   // ← 이 줄 추가!
      type: ssd.type,
      capacity: ssd.capacity,
      price: res.price,
      url: res.url,
      title: res.title || query
    });
    console.log(`[${outputFilename}] ${query} => ${res.price}원`);
    await new Promise(r => setTimeout(r, 1100)); // 쿼터 방지
  }
  await fs.writeFile(outputFilename, JSON.stringify(resultList, null, 2));
  console.log(`✅ ${outputFilename} 저장 완료!`);
}

// 전체 실행 함수
async function crawlAll() {
  await crawlAndSave('./frontend/public/data/ssd_type_list.json', './frontend/public/data/ssd_naver_price.json');
}

crawlAll();
