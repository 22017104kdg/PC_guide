// ssd_danawa_price.js
const fs = require('fs').promises;
const puppeteer = require('puppeteer');

// 부품 리스트 읽기 (배열/객체 모두 지원)
async function readPartsJson(filename) {
  try {
    const data = await fs.readFile(filename, 'utf-8');
    const json = JSON.parse(data);
    if (Array.isArray(json)) return json;
    if (json.ssd && Array.isArray(json.ssd)) return json.ssd;
    return [];
  } catch (err) {
    console.error(`❗ 파일 읽기 오류: ${filename}`, err);
    return [];
  }
}

// 다나와 최저가/URL 크롤링 함수
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

// 부품별 크롤링/저장 함수
async function crawlAndSave(partsFilename, outputFilename) {
  const parts = await readPartsJson(partsFilename);

  if (!Array.isArray(parts)) {
    console.error('❗ JSON 파일 내용이 배열이 아닙니다:', parts);
    return;
  }

  const resultList = [];

  for (const part of parts) {
    // 규격+용량 조합으로 model 통일 (예: "NVMe SSD 1TB")
    const modelStr = `${part.type} SSD ${part.capacity}`;
    const query = part.model || modelStr;
    const danawa = await getDanawaPriceAndUrl(query);

    resultList.push({
      model: modelStr,         // ★ 일관성 있게 model 명칭 통일
      type: part.type,
      capacity: part.capacity,
      price: danawa.price,
      url: danawa.url,
      title: danawa.title || query,
    });
    console.log(`[ssd_danawa_price.json] ${query} => ${danawa.price}원`);
    await new Promise((res) => setTimeout(res, 1500)); // 딜레이
  }

  try {
    await fs.writeFile(outputFilename, JSON.stringify(resultList, null, 2));
    console.log(`✅ ${outputFilename} 저장 완료!`);
  } catch (err) {
    console.error(`❗ ${outputFilename} 저장 중 오류 발생`, err);
  }
}

// 실행 함수
async function crawlAll() {
  await crawlAndSave('./frontend/public/data/ssd_type_list.json', './frontend/public/data/ssd_danawa_price.json');
}

crawlAll();
