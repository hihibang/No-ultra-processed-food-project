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

const cleanDate = (val) => {
  if (!val) return null;
  const clean = String(val).replace(/[^0-9]/g, '');
  if (clean.length === 8) {
    return `${clean.substring(0, 4)}-${clean.substring(4, 6)}-${clean.substring(6, 8)}`;
  }
  return null;
};

async function insertBatch(records) {
  if (records.length === 0) return;

  const query = `
    INSERT INTO food_additive_standard (
      additive_code, additive_name, detail_item_name,
      standard_summary, is_hazard, valid_start_date, valid_end_date
    ) VALUES ?
    ON DUPLICATE KEY UPDATE
      additive_name = VALUES(additive_name),
      detail_item_name = VALUES(detail_item_name),
      standard_summary = VALUES(standard_summary),
      is_hazard = VALUES(is_hazard),
      valid_start_date = VALUES(valid_start_date),
      valid_end_date = VALUES(valid_end_date)
  `;

  await pool.query(query, [records]);
}

async function loadAdditiveData() {
  const apiKey = process.env.FOOD_SAFETY_API_KEY;

  if (!apiKey) {
    console.error('❌ .env 파일에 FOOD_SAFETY_API_KEY 설정이 없습니다.');
    process.exit(1);
  }

  const SERVICE_ID = 'I0950';
  const BATCH_SIZE = 1000;
  let startIndex = 1;
  let totalCount = 0;
  let totalProcessed = 0;

  console.log(`🚀 [3번] 식품안전나라 (${SERVICE_ID}) 데이터 수집 시작...`);

  while (true) {
    const endIndex = startIndex + BATCH_SIZE - 1;
    const url = `http://openapi.foodsafetykorea.go.kr/api/${apiKey}/${SERVICE_ID}/json/${startIndex}/${endIndex}`;

    try {
      const response = await axios.get(url, { timeout: 30000 });
      const serviceData = response.data?.[SERVICE_ID];

      if (!serviceData) {
        console.warn(`\n⚠️ 응답 데이터 형식 오류:`, JSON.stringify(response.data).substring(0, 150));
        break;
      }

      const resultCode = serviceData.RESULT?.CODE;
      if (resultCode !== 'INFO-000') {
        if (resultCode === 'INFO-200') {
          console.log('\nℹ️ 모든 데이터 수신 완료.');
        } else {
          console.warn(`\n⚠️ API 결과 메시지: [${resultCode}] ${serviceData.RESULT?.MSG}`);
        }
        break;
      }

      if (startIndex === 1) {
        totalCount = parseInt(serviceData.total_count, 10) || 0;
        console.log(`📊 전체 데이터 건수: ${totalCount.toLocaleString()}건`);
      }

      const rows = serviceData.row || [];
      if (rows.length === 0) break;

      const records = [];
      for (const row of rows) {
        const prdlstCd = cleanString(row.PRDLST_CD, 50);
        const testitmCd = cleanString(row.TESTITM_CD, 50);
        
        // 동일 첨가물 내 세부 검사항목별로 코드가 나뉘므로 복합 키 구성
        const code = prdlstCd && testitmCd ? `${prdlstCd}_${testitmCd}` : (prdlstCd || testitmCd);
        const name = cleanString(row.PC_KOR_NM, 255);

        if (!code || !name) continue;

        const detailItemName = cleanString(row.FNPRT_ITM_NM || row.T_KOR_NM, 255);
        const standardSummary = cleanString(row.SPEC_VAL_SUMUP || row.SPEC_VAL, 65535);
        const isHazard = (row.INJRY_YN === 'Y' || row.INJRY_YN === '1') ? 1 : 0;
        const validStartDate = cleanDate(row.VALD_BEGN_DT);
        const validEndDate = cleanDate(row.VALD_END_DT);

        records.push([
          code,
          name,
          detailItemName,
          standardSummary,
          isHazard,
          validStartDate,
          validEndDate,
        ]);
      }

      if (records.length > 0) {
        await insertBatch(records);
        totalProcessed += records.length;
      }

      process.stdout.write(
        `📡 진행: ${totalProcessed.toLocaleString()} / ${totalCount.toLocaleString()}건 적재 완료\r`
      );

      if (endIndex >= totalCount) break;

      startIndex += BATCH_SIZE;
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      console.error(`\n❌ [Index ${startIndex}~${endIndex}] 요청 실패:`, err.message);
      break;
    }
  }

  console.log(`\n🎉 [3번] 식품첨가물 마스터 적재 완료! (총 ${totalProcessed.toLocaleString()}건)`);
  await pool.end();
}

loadAdditiveData();