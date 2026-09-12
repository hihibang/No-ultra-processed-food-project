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

const cleanText = (val) => {
  if (!val) return null;
  const str = String(val).trim();
  return str === '' || str === '-' || str === '해당없음' ? null : str;
};

const cleanNumber = (val) => {
  if (!val) return 0.0;
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0.0 : num;
};

// 01~20 만드는 법 순서를 쉼표(', ')로 연결
function combineManualSteps(row) {
  const steps = [];
  for (let i = 1; i <= 20; i++) {
    const key = `MANUAL${String(i).padStart(2, '0')}`;
    if (row[key]) {
      // 텍스트 내부 개행 제거 및 양끝 공백 정리
      const stepText = String(row[key]).trim().replace(/[\r\n]+/g, ' ');
      if (stepText) steps.push(stepText);
    }
  }
  return steps.length > 0 ? steps.join(', ') : null;
}

async function insertBatch(records) {
  if (records.length === 0) return;

  const query = `
    INSERT INTO recipe (
      recipe_id, menu_name, cooking_method, recipe_type,
      serving_weight, ingredients, calories, carbohydrate,
      protein, fat, sodium, cooking_steps_desc
    ) VALUES ?
    ON DUPLICATE KEY UPDATE
      menu_name = VALUES(menu_name),
      cooking_method = VALUES(cooking_method),
      recipe_type = VALUES(recipe_type),
      serving_weight = VALUES(serving_weight),
      ingredients = VALUES(ingredients),
      calories = VALUES(calories),
      carbohydrate = VALUES(carbohydrate),
      protein = VALUES(protein),
      fat = VALUES(fat),
      sodium = VALUES(sodium),
      cooking_steps_desc = VALUES(cooking_steps_desc)
  `;

  await pool.query(query, [records]);
}

async function loadRecipeData() {
  const apiKey = process.env.FOOD_SAFETY_API_KEY;

  if (!apiKey) {
    console.error('❌ .env 파일에 FOOD_SAFETY_API_KEY 설정이 없습니다.');
    process.exit(1);
  }

  const SERVICE_ID = 'COOKRCP01';
  const BATCH_SIZE = 1000;
  let startIndex = 1;
  let totalCount = 0;
  let totalProcessed = 0;

  console.log(`🚀 [4번] 조리식품 레시피(${SERVICE_ID}) 데이터 수집 시작...`);

  while (true) {
    const endIndex = startIndex + BATCH_SIZE - 1;
    const url = `http://openapi.foodsafetykorea.go.kr/api/${apiKey}/${SERVICE_ID}/json/${startIndex}/${endIndex}`;

    try {
      const response = await axios.get(url, { timeout: 30000 });
      const serviceData = response.data?.[SERVICE_ID];

      if (!serviceData) {
        console.warn(`\n⚠️ 응답 데이터 구조 확인 불가:`, JSON.stringify(response.data).substring(0, 150));
        break;
      }

      const resultCode = serviceData.RESULT?.CODE;
      if (resultCode !== 'INFO-000') {
        if (resultCode === 'INFO-200') {
          console.log('\nℹ️ 모든 레시피 데이터를 정상 수신했습니다.');
        } else {
          console.warn(`\n⚠️ API 결과 메시지: [${resultCode}] ${serviceData.RESULT?.MSG}`);
        }
        break;
      }

      if (startIndex === 1) {
        totalCount = parseInt(serviceData.total_count, 10) || 0;
        console.log(`📊 전체 레시피 건수: ${totalCount.toLocaleString()}건`);
      }

      const rows = serviceData.row || [];
      if (rows.length === 0) break;

      const records = [];
      for (const row of rows) {
        const recipeId = parseInt(row.RCP_SEQ, 10);
        const menuName = cleanString(row.RCP_NM, 255);
        const ingredients = cleanText(row.RCP_PARTS_DTLS);

        // NOT NULL 제약조건 검증 (recipe_id, menu_name, ingredients)
        if (isNaN(recipeId) || !menuName || !ingredients) continue;

        records.push([
          recipeId,
          menuName,
          cleanString(row.RCP_WAY2, 100),              // cooking_method
          cleanString(row.RCP_PAT2, 100),              // recipe_type
          cleanString(row.INFO_WGT, 50),               // serving_weight
          ingredients,                                 // ingredients
          cleanNumber(row.INFO_ENG),                   // calories
          cleanNumber(row.INFO_CAR),                   // carbohydrate
          cleanNumber(row.INFO_PRO),                   // protein
          cleanNumber(row.INFO_FAT),                   // fat
          cleanNumber(row.INFO_NA),                    // sodium
          combineManualSteps(row),                     // cooking_steps_desc
        ]);
      }

      if (records.length > 0) {
        await insertBatch(records);
        totalProcessed += records.length;
      }

      process.stdout.write(
        `📡 진행: ${totalProcessed.toLocaleString()} / ${totalCount.toLocaleString()}건 적재 중...\r`
      );

      if (endIndex >= totalCount) break;

      startIndex += BATCH_SIZE;
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      console.error(`\n❌ [Index ${startIndex}~${endIndex}] 요청 실패:`, err.message);
      break;
    }
  }

  console.log(`\n🎉 [4번] 조리식품 레시피 데이터 적재 완료! (총 ${totalProcessed.toLocaleString()}건)`);
  await pool.end();
}

loadRecipeData();