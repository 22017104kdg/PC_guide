// ssd_danawa_best.js
const fs = require('fs').promises;
const puppeteer = require('puppeteer');

// SSD 리스트 읽기 (배열/객체 모두 지원)
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

// 다나와 리뷰 많은순 크롤링 함수
async function getDanawaBestReview(query) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const url = `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(query)}&sort=review_cnt_d`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await new Promise(r => setTimeout(r, 2500)); // 렌더링 대기

  const result = await page.evaluate(() => {
    const card =
      document.querySelector('.main_prodlist .prod_item') ||
      document.querySelector('.product_list .prod_item') ||
      document.querySelector('.prod_main_info');
    if (!card) return null;

    // 리뷰수 파싱
    let reviewCount = "0";
    const reviewElem =
      card.querySelector('.count_opinion') ||
      card.querySelector('.count_review') ||
      card.querySelector('.cmt_count');
    if (reviewElem) {
      reviewCount = reviewElem.textContent.replace(/[^\d]/g, "");
    } else {
      // 텍스트 내 대체 파싱
      const altText = card.innerText.match(/(상품의견|리뷰)[^\d]*(\d+)/);
      if (altText) reviewCount = altText[2];
    }

    const titleElem = card.querySelector('.prod_name a, .info_tit a');
    const priceElem = card.querySelector('.price_sect strong, .price_wrap .price');
    const urlElem = card.querySelector('.prod_name a, .info_tit a');

    return {
      title: titleElem ? titleElem.textContent.trim() : "",
      price: priceElem ? priceElem.textContent.replace(/[^\d]/g, "") : null,
      url: urlElem ? urlElem.href : "",
      reviewCount: reviewCount || "0"
    };
  });

  await browser.close();

  if (!result || !result.price) {
    return { price: "검색불가", url: "", title: "", reviewCount: "0" };
  }
  return result;
}

// 크롤링 및 저장 함수
async function crawlAndSave(partsFilename, outputFilename) {
  const parts = await readPartsJson(partsFilename);

  if (!Array.isArray(parts)) {
    console.error('❗ JSON 파일 내용이 배열이 아닙니다:', parts);
    return;
  }

  const resultList = [];
  for (const part of parts) {
    // model 통일 (예: "NVMe SSD 1TB")
    const modelStr = `${part.type} SSD ${part.capacity}`;
    const query = part.model || modelStr;
    const best = await getDanawaBestReview(query);

    resultList.push({
      model: modelStr,        // model 명칭 통일 (프론트 일치)
      type: part.type,
      capacity: part.capacity,
      price: best.price,
      url: best.url,
      title: best.title || query,
      reviewCount: best.reviewCount
    });
    console.log(`[${outputFilename}] ${query} => ${best.price}원 (리뷰 ${best.reviewCount}개)`);
    await new Promise((res) => setTimeout(res, 1800)); // 과도한 크롤링 방지
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
  await crawlAndSave('./frontend/public/data/ssd_type_list.json', './frontend/public/data/ssd_danawa_best.json');
}

crawlAll();
