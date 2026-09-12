// 2번 DB: 식품(첨가물)품목제조보고(원재료)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as csv from 'fast-csv';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 초가공식품(UPF) 분석 핵심 타깃 유형
const TARGET_PRODUCT_TYPES = new Set([
  // 스낵 / 제과 / 빵
  '빵류', '과자', '캔디류', '초콜릿', '초콜릿가공품', '빙과', '아이스크림',
  // 편의 / 즉석식품 (HMR)
  '즉석조리식품', '즉석섭취식품', '간편조리세트', '만두',
  // 음료
  '커피', '액상차', '혼합음료', '과.채주스', '과.채음료', '음료베이스', '탄산음료',
  // 가공육 / 면류 / 어육
  '식육함유가공품', '햄', '소시지', '숙면', '유탕면', '어묵',
  // 소스 및 조미
  '소스', '복합조미식품'
]);

const cleanString = (val, maxLen = 255) => {
  if (!val) return null;
  const str = String(val).trim();
  if (str === '' || str === '-' || str === '해당없음') return null;
  return str.length > maxLen ? str.substring(0, maxLen) : str;
};

const cleanText = (val) => {
  if (!val) return null;
  const str = String(val).trim();
  return str === '' || str === '-' || str === '해당없음' ? null : str;
};

const cleanDate = (val) => {
  if (!val) return null;
  const str = String(val).trim().replace(/[^0-9-]/g, '');
  if (str === '' || str === '-' || str === '해당없음') return null;
  if (/^\d{8}$/.test(str)) {
    return `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`;
  }
  return str.length > 10 ? str.substring(0, 10) : str;
};

async function insertBatch(records) {
  if (records.length === 0) return;

  const query = `
    INSERT INTO food_product (
      report_no, license_no, company_name, product_name, 
      product_type, raw_materials, report_date, change_date
    ) VALUES ?
    ON DUPLICATE KEY UPDATE
      license_no = VALUES(license_no),
      company_name = VALUES(company_name),
      product_name = VALUES(product_name),
      product_type = VALUES(product_type),
      raw_materials = VALUES(raw_materials),
      report_date = VALUES(report_date),
      change_date = VALUES(change_date),
      updated_at = CURRENT_TIMESTAMP
  `;

  await pool.query(query, [records]);
}

async function loadProductFromCsv() {
  // server 디렉토리 내 C002로 시작하는 csv 파일 자동 탐색
  const serverDir = process.cwd();
  const files = fs.readdirSync(serverDir);
  const targetCsv = files.find(file => file.startsWith('C002') && file.endsWith('.csv'));

  if (!targetCsv) {
    console.error(`❌ server 디렉토리에 C002*.csv 파일을 찾을 수 없습니다.`);
    await pool.end();
    return;
  }

  const csvFilePath = path.join(serverDir, targetCsv);

  console.log(`🚀 [food_product] ${targetCsv} 타깃 선별 고속 스트리밍 적재 시작...`);
  console.log(`🎯 선별 타깃 식품유형: ${TARGET_PRODUCT_TYPES.size}개`);

  const BATCH_SIZE = 2000;
  let batch = [];
  let totalRead = 0;
  let totalInserted = 0;
  const startTime = Date.now();

  const stream = fs.createReadStream(csvFilePath)
    .pipe(csv.parse({ headers: true, trim: true }))
    .on('error', (error) => console.error('❌ CSV 파싱 에러:', error))
    .on('data', async (row) => {
      totalRead++;

      const reportNo = cleanString(row.PRDLST_REPORT_NO);
      const prdType = cleanString(row.PRDLST_DCNM);

      if (reportNo && reportNo !== '0' && prdType && TARGET_PRODUCT_TYPES.has(prdType)) {
        batch.push([
          reportNo,
          cleanString(row.LCNS_NO),
          cleanString(row.BSSH_NM),
          cleanString(row.PRDLST_NM) || '이름미상',
          prdType,
          cleanText(row.RAWMTRL_NM),
          cleanDate(row.PRMS_DT),
          cleanDate(row.CHNG_DT),
        ]);
      }

      if (batch.length >= BATCH_SIZE) {
        stream.pause();
        const currentBatch = [...batch];
        batch = [];

        try {
          await insertBatch(currentBatch);
          totalInserted += currentBatch.length;
          process.stdout.write(`💾 적재 중: ${totalInserted.toLocaleString()}건 (스캔: ${totalRead.toLocaleString()}건)\r`);
        } catch (dbErr) {
          console.error('\n❌ DB 적재 실패:', dbErr.message);
        } finally {
          stream.resume();
        }
      }
    })
    .on('end', async () => {
      try {
        if (batch.length > 0) {
          await insertBatch(batch);
          totalInserted += batch.length;
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n🎉 food_product 적재 완료!`);
        console.log(`- 전체 원천 데이터: ${totalRead.toLocaleString()}건`);
        console.log(`- 타깃 선별 적재량: ${totalInserted.toLocaleString()}건`);
        console.log(`- 총 소요 시간: ${elapsed}초`);

        // ★ 스트림 완료 및 DB 적재 성공 후 안전하게 파일 삭제
        if (fs.existsSync(csvFilePath)) {
          fs.unlinkSync(csvFilePath);
          console.log(`🧹 디스크 정리 완료: ${targetCsv} 파일이 안전하게 삭제되었습니다.`);
        }
      } catch (err) {
        console.error('❌ 완료 처리 중 오류 발생:', err.message);
      } finally {
        await pool.end();
      }
    });
}

loadProductFromCsv();