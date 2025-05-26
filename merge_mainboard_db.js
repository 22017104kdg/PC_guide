// merge_mainboard_db.js
const fs = require('fs').promises;
const path = require('path');

async function mergeMainboardDB() {
  try {
    // 각 브랜드별 JSON 경로
    const dataDir = path.join(__dirname, 'frontend', 'public', 'data');
    const files = ['asus_mainboard.json', 'msi_mainboard.json', 'gigabyte_mainboard.json'];

    // 각 파일 읽어서 파싱
    const lists = await Promise.all(
      files.map(f => fs.readFile(path.join(dataDir, f), 'utf-8').then(JSON.parse))
    );

    // 합치기
    const merged = lists.flat();

    // mainboardDB.json 에 쓰기
    const outPath = path.join(dataDir, 'mainboardDB.json');
    await fs.writeFile(outPath, JSON.stringify(merged, null, 2), 'utf-8');
    console.log(`✅ mainboardDB.json 생성 완료: ${outPath}`);
  } catch (err) {
    console.error('❌ DB 합치기 실패:', err);
  }
}

mergeMainboardDB();
