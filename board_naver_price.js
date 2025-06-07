const fs = require('fs').promises;
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const clientId = 'kbYKrsf4oiPN7pOKGTYn';
const clientSecret = 'otZzFOKmAZ';

// 네이버 쇼핑 API
async function getNaverShoppingResult(query) {
  try {
    const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=1&sort=sim`;
    const res = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      }
    });
    if (!res.ok) {
      console.error('네이버 API 요청 실패:', res.status, res.statusText, 'query:', query);
      return { price: "검색불가", url: "", title: "" };
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
    return { price: "검색불가", url: "", title: "" };
  } catch (e) {
    console.error('네이버 쇼핑 API 에러:', e, 'query:', query);
    return { price: "검색불가", url: "", title: "" };
  }
}

async function readPartsJson(filename) {
  try {
    const data = await fs.readFile(filename, 'utf-8');
    const json = JSON.parse(data);
    if (Array.isArray(json)) return json;
    return [];
  } catch (e) {
    console.error(`파일 읽기 오류: ${filename}`, e);
    return [];
  }
}

async function crawlAndSave(partsFilename, outputFilename) {
  const parts = await readPartsJson(partsFilename);
  if (!Array.isArray(parts) || parts.length === 0) {
    console.error(`파싱된 부품 리스트가 없습니다: ${partsFilename}`);
    return;
  }
  const resultList = [];
  for (const part of parts) {
    if (!part.model) {
      console.warn(`[${outputFilename}] model 없음:`, part);
      continue;
    }
    const res = await getNaverShoppingResult(part.model);
    resultList.push({
      model: part.model,
      price: res.price,
      url: res.url,
      title: res.title,
    });
    console.log(`[${outputFilename}] ${part.model} => ${res.price}원`);
    await new Promise(r => setTimeout(r, 1000));
  }
  await fs.writeFile(outputFilename, JSON.stringify(resultList, null, 2));
  console.log(`✅ ${outputFilename} 저장 완료!`);
}

async function crawlAllBoards() {
  await crawlAndSave('./frontend/public/data/asus_mainboard.json', './frontend/public/data/asus_naver_price.json');
  await crawlAndSave('./frontend/public/data/msi_mainboard.json', './frontend/public/data/msi_naver_price.json');
  await crawlAndSave('./frontend/public/data/gigabyte_mainboard.json', './frontend/public/data/gigabyte_naver_price.json');
}

crawlAllBoards();
