import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function peekProductCategories() {
  const apiKey = process.env.FOOD_SAFETY_API_KEY;
  const serviceId = 'C002'; // 신청 확인된 C002로 지정
  const startIdx = 1;
  const endIdx = 500; // 샘플 500건 추출
  const fileType = 'json';

  if (!apiKey) {
    console.error('❌ .env에 FOOD_SAFETY_API_KEY가 설정되지 않았습니다.');
    return;
  }

  const url = `http://openapi.foodsafetykorea.go.kr/api/${apiKey}/${serviceId}/${fileType}/${startIdx}/${endIdx}`;

  console.log(`🔍 [식품안전나라 - ${serviceId}] 품목제조보고 데이터 샘플(${endIdx}건) 분석 중...`);

  try {
    const res = await axios.get(url, { timeout: 30000 });
    const apiResult = res.data?.[serviceId];

    if (!apiResult) {
      console.error('❌ API 응답 구조를 확인해 주세요:', res.data);
      return;
    }

    const header = apiResult.RESULT;
    if (header?.CODE !== 'INFO-000') {
      console.error(`❌ 에러 코드: ${header?.CODE}, 메시지: ${header?.MSG}`);
      return;
    }

    const rows = apiResult.row || [];
    console.log(`✅ 수신 데이터: ${rows.length}건 (전체 데이터 건수: ${apiResult.total_count}건)`);

    // 식품유형(PRDLST_DCNM) 빈도 집계
    const categoryMap = {};
    for (const row of rows) {
      const prdType = row.PRDLST_DCNM ? row.PRDLST_DCNM.trim() : '미분류';
      categoryMap[prdType] = (categoryMap[prdType] || 0) + 1;
    }

    const result = Object.entries(categoryMap)
      .map(([category, count]) => ({
        '식품유형 (PRDLST_DCNM)': category,
        '샘플 건수': count,
      }))
      .sort((a, b) => b['샘플 건수'] - a['샘플 건수']);

    console.table(result);

    if (rows.length > 0) {
      console.log('\n📄 [C002 원재료 텍스트 샘플 1건]');
      console.log(`- 제품명: ${rows[0].PRDLST_NM}`);
      console.log(`- 식품유형: ${rows[0].PRDLST_DCNM}`);
      console.log(`- 품목제조번호: ${rows[0].PRDLST_REPORT_NO}`);
      console.log(`- 원재료 내용: ${rows[0].RAWMTRL_NM}`);
    }
  } catch (error) {
    console.error('❌ 요청 중 에러 발생:', error.message);
  }
}

peekProductCategories();