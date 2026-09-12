import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function peekCategories() {
  const ENDPOINT = 'https://api.data.go.kr/openapi/tn_pubr_public_nutri_process_info_api';
  const serviceKey = process.env.DATA_GO_KR_API_KEY;

  console.log('🔍 API 데이터 샘플(500건) 카테고리 분석 중...');

  const categoryMap = {};

  // 1~5페이지(총 500건)만 샘플링
  for (let page = 1; page <= 5; page++) {
    const url = `${ENDPOINT}?serviceKey=${serviceKey}&pageNo=${page}&numOfRows=100&type=json`;
    const res = await axios.get(url);
    const items = res.data?.body?.items?.item || [];

    for (const item of items) {
      const lClas = item.foodLv3Nm || '미분류(대)';
      const sClas = item.foodLv4Nm || '미분류(소)';
      const key = `${lClas} > ${sClas}`;
      categoryMap[key] = (categoryMap[key] || 0) + 1;
    }
  }

  // 보기 좋게 테이블 형태로 콘솔 출력
  const result = Object.entries(categoryMap)
    .map(([category, count]) => ({ '카테고리 (대분류 > 소분류)': category, '샘플 건수': count }))
    .sort((a, b) => b['샘플 건수'] - a['샘플 건수']);

  console.table(result);
}

peekCategories();