import axios from 'axios';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'food_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const cleanString = (val, maxLen = 255) => {
  if (!val) return null;
  const str = String(val).trim();
  if (str === '' || str === '-' || str === '해당없음') return null;
  return str.length > maxLen ? str.substring(0, maxLen) : str;
};

const cleanNumber = (val) => {
  if (!val) return 0.0;
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0.0 : num;
};

async function insertBatch(records) {
  if (records.length === 0) return;

  const query = `
    INSERT INTO food_nutrition (
      report_no, food_code, food_name, manufacturer,
      category_large, category_small, serving_size, total_weight,
      calories, carbohydrate, protein, fat,
      sugars, sodium, saturated_fat, trans_fat, cholesterol
    ) VALUES ?
    ON DUPLICATE KEY UPDATE
      food_code = VALUES(food_code),
      food_name = VALUES(food_name),
      manufacturer = VALUES(manufacturer),
      category_large = VALUES(category_large),
      category_small = VALUES(category_small),
      serving_size = VALUES(serving_size),
      total_weight = VALUES(total_weight),
      calories = VALUES(calories),
      carbohydrate = VALUES(carbohydrate),
      protein = VALUES(protein),
      fat = VALUES(fat),
      sugars = VALUES(sugars),
      sodium = VALUES(sodium),
      saturated_fat = VALUES(saturated_fat),
      trans_fat = VALUES(trans_fat),
      cholesterol = VALUES(cholesterol),
      updated_at = CURRENT_TIMESTAMP
  `;

  await pool.query(query, [records]);
}

function extractItems(body) {
  if (!body) return [];
  let rawItems = body.items;

  if (Array.isArray(rawItems)) return rawItems;
  if (rawItems && typeof rawItems === 'object') {
    if (Array.isArray(rawItems.item)) return rawItems.item;
    if (rawItems.item && typeof rawItems.item === 'object') return [rawItems.item];
    return [rawItems];
  }
  if (Array.isArray(body.item)) return body.item;
  if (body.item && typeof body.item === 'object') return [body.item];

  return [];
}

// 4번: 최종 사용자 검색 테이블 자동 갱신 함수
async function refreshActiveCatalog() {
  console.log('\n⚙️ [자동화] active_food_catalog 최종 서빙 테이블 갱신 시작...');
  const conn = await pool.getConnection();

  try {
    console.log('- 1/4. 제품명 정규화 컬럼 동기화...');
    await conn.query(`
      UPDATE food_product
      SET normalized_name = TRIM(
        REGEXP_REPLACE(
          REGEXP_REPLACE(product_name, '\\\\s*\\\\([^)]*\\\\)|\\\\s*\\\\[[^\\]]*\\\\]', ''), 
          '\\\\s*[0-9]+(\\\\.[0-9]+)?\\\\s*(g|kg|ml|l|L|개입|입|봉|EA|ea)$', ''
        )
      )
      WHERE normalized_name IS NULL;
    `);

    console.log('- 2/4. 기존 active_food_catalog 정리...');
    await conn.query(`DROP TABLE IF EXISTS active_food_catalog;`);

    console.log('- 3/4. 최신 대표 품목 캐시 테이블 생성 중 (v_active_food_catalog 복제)...');
    await conn.query(`
      CREATE TABLE active_food_catalog AS
      SELECT * FROM v_active_food_catalog;
    `);

    console.log('- 4/4. 검색 최적화 인덱스 생성 중...');
    await conn.query(`ALTER TABLE active_food_catalog ADD PRIMARY KEY (report_no);`);
    await conn.query(`CREATE INDEX idx_catalog_norm_name ON active_food_catalog (normalized_name);`);
    await conn.query(`CREATE INDEX idx_catalog_company ON active_food_catalog (company_name);`);
    await conn.query(`CREATE INDEX idx_catalog_type ON active_food_catalog (product_type);`);

    const [[{ total }]] = await conn.query(`SELECT COUNT(*) AS total FROM active_food_catalog;`);
    console.log(`✅ active_food_catalog 갱신 완료! (총 대표 품목 수: ${total.toLocaleString()}건)`);
  } catch (err) {
    console.error('❌ 캐시 테이블 갱신 중 오류 발생:', err.message);
  } finally {
    conn.release();
  }
}

async function loadNutritionData() {
  let serviceKey = process.env.DATA_GO_KR_API_KEY || '';

  if (!serviceKey) {
    console.error('❌ .env 파일에 DATA_GO_KR_API_KEY 설정이 없습니다.');
    process.exit(1);
  }

  try {
    serviceKey = decodeURIComponent(serviceKey);
  } catch (e) {}

  const baseUrl = 'http://api.data.go.kr/openapi/tn_pubr_public_nutri_process_info_api';

  console.log('📦 1. DB에서 food_product 품목보고번호 목록 로딩 중...');
  const [rows] = await pool.query('SELECT report_no FROM food_product');
  const validReportNoSet = new Set(rows.map((r) => String(r.report_no).trim()));
  console.log(`✅ 기준 타깃 품목 수: ${validReportNoSet.size.toLocaleString()}개`);

  const NUM_OF_ROWS = 1000;
  let pageNo = 1;
  let totalMatched = 0;
  let totalApiProcessed = 0;
  let totalCount = 0;

  console.log('🚀 2. 영양성분 API 수집 및 타깃 매칭 적재 시작...');
  console.log(`📡 대상 엔드포인트: ${baseUrl}`);

  while (true) {
    try {
      const requestUrl = `${baseUrl}?serviceKey=${encodeURIComponent(serviceKey)}&pageNo=${pageNo}&numOfRows=${NUM_OF_ROWS}&type=json`;
      const response = await axios.get(requestUrl, { timeout: 30000 });

      const resData = response.data;
      const body = resData?.response?.body || resData?.body;

      if (!body) {
        console.warn(`\n⚠️ [Page ${pageNo}] 응답 body 없음:`, JSON.stringify(resData).substring(0, 150));
        break;
      }

      if (pageNo === 1) {
        totalCount = parseInt(body.totalCount, 10) || 0;
        console.log(`📊 API 전체 건수: ${totalCount.toLocaleString()}건`);
      }

      const items = extractItems(body);
      if (items.length === 0) {
        console.log(`\nℹ️ [Page ${pageNo}] 더 이상 데이터가 없습니다.`);
        break;
      }

      totalApiProcessed += items.length;

      const matchedRecords = [];
      for (const item of items) {
        const rptNo = cleanString(
          item.itemMnftrRptNo || 
          item.ITEM_MANUFAC_NO || 
          item.prdlstReportNo || 
          item.item_report_no ||
          item.prdlst_report_no
        );

        if (!rptNo || !validReportNoSet.has(rptNo)) continue;

        matchedRecords.push([
          rptNo,
          cleanString(item.foodCd || item.FOOD_CD, 50),
          cleanString(item.foodNm || item.FOOD_NM, 255) || '이름미상',
          cleanString(item.entrpsNm || item.bsshNm || item.MAKER_NM || item.insttNm, 150),
          cleanString(item.foodLv3Nm || item.MAIN_GRP_NM || item.foodCategory, 100),
          cleanString(item.foodLv4Nm || item.SUB_GRP_NM, 100),
          cleanString(item.servingSize || item.SERVING_SIZE, 50),
          cleanString(item.foodSize || item.TOTAL_WT, 50),
          cleanNumber(item.enerc || item.amtNum1 || item.NUTR_CONT1),
          cleanNumber(item.chocdf || item.amtNum7 || item.NUTR_CONT2),
          cleanNumber(item.prot || item.amtNum3 || item.NUTR_CONT3),
          cleanNumber(item.fatce || item.amtNum4 || item.NUTR_CONT4),
          cleanNumber(item.sugar || item.amtNum8 || item.NUTR_CONT5),
          cleanNumber(item.nat || item.amtNum6 || item.NUTR_CONT6),
          cleanNumber(item.fasat || item.amtNum24 || item.NUTR_CONT8),
          cleanNumber(item.fatrn || item.amtNum25 || item.NUTR_CONT9),
          cleanNumber(item.chole || item.amtNum23 || item.NUTR_CONT7),
        ]);
      }

      if (matchedRecords.length > 0) {
        await insertBatch(matchedRecords);
        totalMatched += matchedRecords.length;
      }

      process.stdout.write(
        `📡 [Page ${pageNo}] 진행: ${totalApiProcessed.toLocaleString()}/${totalCount.toLocaleString()} | 🎯 매칭 적재: ${totalMatched.toLocaleString()}건\r`
      );

      if (totalApiProcessed >= totalCount) break;

      pageNo++;
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      console.error(`\n❌ [Page ${pageNo}] 요청 실패:`, err.message);
      break;
    }
  }

  console.log(`\n🎉 영양성분 수집 완료! (매칭 적재: ${totalMatched.toLocaleString()}건)`);

  // 영양성분 수집 완료 후 4번 캐시 갱신 자동 트리거
  await refreshActiveCatalog();

  await pool.end();
}

loadNutritionData();