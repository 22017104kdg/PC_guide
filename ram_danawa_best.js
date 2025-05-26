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

// 2. 다나와 리뷰 많은순 가격/URL 크롤링 함수
async function getDanawaBestReview(query) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // 리뷰순: sort=review_cnt_d
  const url = `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(query)}&sort=review_cnt_d`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000)); // 후기 노출 대기

  const result = await page.evaluate(() => {
    const card =
      document.querySelector('.main_prodlist .prod_item')
      || document.querySelector('.product_list .prod_item')
      || document.querySelector('.prod_main_info');
    if (!card) return null;

    let reviewCount = "0";
    const reviewElem =
      card.querySelector('.count_opinion') ||
      card.querySelector('.count_review') ||
      card.querySelector('.cmt_count');
    if (reviewElem) {
      reviewCount = reviewElem.textContent.replace(/[^\d]/g, "");
    } else {
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

// 3. RAM별 크롤링 및 저장
async function crawlAndSave(ramListFilename, outputFilename) {
  const ramList = await readRamJson(ramListFilename);

  if (!Array.isArray(ramList)) {
    console.error('❗ RAM JSON 파일이 배열이 아닙니다:', ramList);
    return;
  }

  const resultList = [];
  for (const ram of ramList) {
    const query = ram.model;
    const best = await getDanawaBestReview(query);

    resultList.push({
      model: ram.model,
      type: ram.type,
      size_gb: ram.size_gb,
      brand: ram.brand,
      price: best.price,
      url: best.url,
      title: best.title,
      reviewCount: best.reviewCount
    });

    console.log(`[${outputFilename}] ${ram.model} => ${best.price}원 (리뷰 ${best.reviewCount}개)`);
    await new Promise((res) => setTimeout(res, 1800)); // 딜레이
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
  // 경로는 프로젝트에 맞게 수정하세요!
  await crawlAndSave('./frontend/public/data/ramList.json', './frontend/public/data/ram_danawa_best.json');
}

crawlAllRam();
