const fs = require('fs').promises;
const puppeteer = require('puppeteer');

// 네이버 API 정보 (네이버 크롤링 코드 필요시 사용)
const clientId = 'kbYKrsf4oiPN7pOKGTYn';
const clientSecret = 'otZzFOKmAZ';

// 부품 리스트 읽기 (배열/객체 모두 지원)
async function readPartsJson(filename) {
  try {
    const data = await fs.readFile(filename, 'utf-8');
    const json = JSON.parse(data);
    if (Array.isArray(json)) return json;
    if (json.mainboard && Array.isArray(json.mainboard)) return json.mainboard;
    return [];
  } catch (err) {
    console.error(`❗ 파일 읽기 오류: ${filename}`, err);
    return [];
  }
}

// 1. 다나와 최저가/URL 크롤링 함수
async function getDanawaPriceAndUrl(query) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(
    `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(query)}`,
    { waitUntil: 'domcontentloaded' }
  );

  const result = await page.evaluate(() => {
    const card =
      document.querySelector('.main_prodlist .prod_item')
      || document.querySelector('.product_list .prod_item')
      || document.querySelector('.prod_main_info');

    if (!card) return null;

    const titleElem = card.querySelector('.prod_name a, .info_tit a');
    const priceElem = card.querySelector('.price_sect strong, .price_wrap .price');
    const urlElem = card.querySelector('.prod_name a, .info_tit a');

    return {
      title: titleElem ? titleElem.textContent.trim() : "",
      price: priceElem ? priceElem.textContent.replace(/[^\d]/g, "") : null,
      url: urlElem ? urlElem.href : ""
    };
  });

  await browser.close();
  if (!result || !result.price) {
    return { price: "검색불가", url: "", title: "" };
  }
  return result;
}

// 2. 네이버 쇼핑 크롤링 함수 (선택적 사용)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
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

// 3. 다나와용 크롤링/저장 함수
async function crawlAndSaveDanawa(partsFilename, outputFilename) {
  const parts = await readPartsJson(partsFilename);

  if (!Array.isArray(parts)) {
    console.error('❗ JSON 파일 내용이 배열이 아닙니다:', parts);
    return;
  }

  const resultList = [];

  for (const part of parts) {
    let query = part.model;
    if (!query) {
      console.warn(`[${outputFilename}] model 없음:`, part);
      continue;
    }
    const danawa = await getDanawaPriceAndUrl(query);

    resultList.push({
      model: part.model,
      price: danawa.price,
      url: danawa.url,
      title: danawa.title,
    });
    console.log(`[${outputFilename}] ${part.model} => ${danawa.price}원`);
    await new Promise((res) => setTimeout(res, 1500)); // 딜레이
  }

  try {
    await fs.writeFile(outputFilename, JSON.stringify(resultList, null, 2));
    console.log(`✅ ${outputFilename} 저장 완료!`);
  } catch (err) {
    console.error(`❗ ${outputFilename} 저장 중 오류 발생`, err);
  }
}

// 4. 네이버용 크롤링/저장 함수 (선택적 사용)
async function crawlAndSaveNaver(partsFilename, outputFilename) {
  const parts = await readPartsJson(partsFilename);

  if (!Array.isArray(parts)) {
    console.error('❗ JSON 파일 내용이 배열이 아닙니다:', parts);
    return;
  }

  const resultList = [];

  for (const part of parts) {
    let query = part.model;
    if (!query) {
      console.warn(`[${outputFilename}] model 없음:`, part);
      continue;
    }
    const naver = await getNaverShoppingResult(query);

    resultList.push({
      model: part.model,
      price: naver.price,
      url: naver.url,
      title: naver.title,
    });
    console.log(`[${outputFilename}] ${part.model} => ${naver.price}원`);
    await new Promise((res) => setTimeout(res, 1100)); // 네이버는 1초 이상 권장
  }

  try {
    await fs.writeFile(outputFilename, JSON.stringify(resultList, null, 2));
    console.log(`✅ ${outputFilename} 저장 완료!`);
  } catch (err) {
    console.error(`❗ ${outputFilename} 저장 중 오류 발생`, err);
  }
}

// 5. 브랜드별로 분기 실행 (msi도 다나와 크롤링)
async function crawlAllBrands() {
  await crawlAndSaveDanawa('./frontend/public/data/asus_mainboard.json', './frontend/public/data/asus_danawa_price.json');
  await crawlAndSaveDanawa('./frontend/public/data/gigabyte_mainboard.json', './frontend/public/data/gigabyte_danawa_price.json');
  await crawlAndSaveDanawa('./frontend/public/data/msi_mainboard.json', './frontend/public/data/msi_danawa_price.json');
}

crawlAllBrands();
