const fs = require('fs').promises;
const puppeteer = require('puppeteer');

// JSON 읽기 함수
async function readBoardsJson(filename) {
  const data = await fs.readFile(filename, 'utf-8');
  const json = JSON.parse(data);
  if (Array.isArray(json)) return json;
  return [];
}

// 다나와 후기 많은순 검색 함수
async function getDanawaBestReview(query) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // 후기 많은순: sort=review_cnt_d
  const url = `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(query)}&sort=review_cnt_d`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await new Promise(r => setTimeout(r, 3000)); // 후기 로딩 대기

  const result = await page.evaluate(() => {
    const card =
      document.querySelector('.main_prodlist .prod_item') ||
      document.querySelector('.product_list .prod_item') ||
      document.querySelector('.prod_main_info');
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
      if (altText) {
        reviewCount = altText[2];
      }
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
async function crawlAndSave(boardsFilename, outputFilename) {
  const boards = await readBoardsJson(boardsFilename);

  if (!Array.isArray(boards)) {
    console.error('❗ JSON 파일 내용이 배열이 아닙니다:', boards);
    return;
  }

  const resultList = [];
  for (const board of boards) {
    const query = board.model;
    const best = await getDanawaBestReview(query);

    resultList.push({
      model: board.model,
      price: best.price,
      url: best.url,
      title: best.title,
      reviewCount: best.reviewCount
    });
    console.log(`[${outputFilename}] ${board.model} => ${best.price}원 (리뷰 ${best.reviewCount}개)`);
    await new Promise((res) => setTimeout(res, 2000));
  }

  try {
    await fs.writeFile(outputFilename, JSON.stringify(resultList, null, 2));
    console.log(`✅ ${outputFilename} 저장 완료!`);
  } catch (err) {
    console.error(`❗ ${outputFilename} 저장 중 오류 발생`, err);
  }
}

// 실행 함수
async function crawlAllBoards() {
  await crawlAndSave('./frontend/public/data/asus_mainboard.json', './frontend/public/data/asus_danawa_best.json');
  await crawlAndSave('./frontend/public/data/msi_mainboard.json', './frontend/public/data/msi_danawa_best.json');
  await crawlAndSave('./frontend/public/data/gigabyte_mainboard.json', './frontend/public/data/gigabyte_danawa_best.json');
}

crawlAllBoards();
