const fs = require('fs').promises;
const puppeteer = require('puppeteer');

// 1. RAM 리스트 읽기
async function readRamJson(filename) {
  try {
    const data = await fs.readFile(filename, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`❗ 파일 읽기 오류: ${filename}`, err);
    return [];
  }
}

// 2. 다나와 최저가/URL 크롤링 함수 (RAM 듀얼 세트용)
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

// 3. RAM별 크롤링 및 저장
async function crawlAndSave(ramListFilename, outputFilename) {
  const ramList = await readRamJson(ramListFilename);

  if (!Array.isArray(ramList)) {
    console.error('❗ RAM JSON 파일이 배열이 아닙니다:', ramList);
    return;
  }

  const resultList = [];
  for (const ram of ramList) {
    // 듀얼 세트 모델명 그대로 검색 (DB에도 (8Gx2) 등 표기 필수)
    const query = ram.model;
    const danawa = await getDanawaPriceAndUrl(query);

    resultList.push({
      model: ram.model,
      type: ram.type,
      size_gb: ram.size_gb,
      brand: ram.brand,
      price: danawa.price,
      url: danawa.url,
      title: danawa.title,
    });

    console.log(`[${outputFilename}] ${ram.model} => ${danawa.price}원`);
    await new Promise((res) => setTimeout(res, 1500)); // 딜레이
  }

  try {
    await fs.writeFile(outputFilename, JSON.stringify(resultList, null, 2));
    console.log(`✅ ${outputFilename} 저장 완료!`);
  } catch (err) {
    console.error(`❗ ${outputFilename} 저장 중 오류 발생`, err);
  }
}

// 4. 실행
async function crawlAllRam() {
  // ↓ 경로는 프로젝트 구조에 맞게 수정 (예: frontend/public/data)
  await crawlAndSave('./frontend/public/data/ramList.json', './frontend/public/data/ram_danawa_price.json');
}

crawlAllRam();
