import os
import time
import requests
import xml.etree.ElementTree as ET
from urllib.parse import unquote, quote
from dotenv import load_dotenv
import pymysql

# ---------------------------------------------------------
# 1. .env 환경 변수 로드
# ---------------------------------------------------------
load_dotenv()

RAW_SERVICE_KEY = os.getenv("PUBLIC_DATA_SERVICE_KEY", "").strip()
SERVICE_KEY = unquote(RAW_SERVICE_KEY)
API_URL = "https://apis.data.go.kr/B553748/CertImgListServiceV3/getCertImgListServiceV3"

DB_CONFIG = {
    'host': os.getenv("DB_HOST", "localhost"),
    'port': int(os.getenv("DB_PORT", 3306)),
    'user': os.getenv("DB_USER", "root"),
    'password': os.getenv("DB_PASSWORD", ""),
    'database': os.getenv("DB_NAME", "food_db"),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

# ---------------------------------------------------------
# 2. 공공 API 호출 함수 (타임아웃 재시도 포함)
# ---------------------------------------------------------
def fetch_haccp_page(page_no=1, num_of_rows=100, retries=3):
    full_url = f"{API_URL}?serviceKey={quote(SERVICE_KEY)}&pageNo={page_no}&numOfRows={num_of_rows}&type=json"
    
    for attempt in range(retries):
        try:
            response = requests.get(full_url, timeout=30)  # 타임아웃 30초로 증대
            if response.status_code == 200 and response.text.strip():
                text_content = response.text.strip()
                products = []

                # XML 구조 파싱
                if text_content.startswith('<'):
                    root = ET.fromstring(text_content)
                    for item in root.findall('.//item'):
                        def get_text(tag):
                            node = item.find(tag)
                            return node.text.strip() if node is not None and node.text else ""

                        no = get_text('prdlstReportNo')
                        img_url = get_text('imgurl1')
                        if no and img_url:
                            products.append((img_url, no))

                # JSON 구조 파싱
                else:
                    data = response.json()
                    items = data.get('body', {}).get('items', [])
                    for item in items:
                        item_data = item.get('item', item)
                        no = item_data.get('prdlstReportNo')
                        img_url = item_data.get('imgurl1')
                        if no and img_url:
                            products.append((img_url, str(no).strip()))

                return products
        except Exception as e:
            time.sleep(2)  # 실패 시 2초 대기 후 재시도
            if attempt == retries - 1:
                print(f"⚠️ Page {page_no} 수집 실패 (시도 {retries}회 초과): {e}")
                
    return []

# ---------------------------------------------------------
# 3. DB 벌크 UPDATE 실행
# ---------------------------------------------------------
def run_bulk_update(total_pages=150, num_of_rows=100):
    print("🚀 active_food_catalog 테이블 image_url 벌크 업데이트 시작...\n")
    
    try:
        connection = pymysql.connect(**DB_CONFIG)
        updated_total = 0

        with connection.cursor() as cursor:
            # UPDATE 쿼리 준비 (report_no가 일치할 때만 image_url 갱신)
            update_sql = """
                UPDATE active_food_catalog 
                SET image_url = %s 
                WHERE report_no = %s AND (image_url IS NULL OR image_url = '');
            """

            for page in range(1, total_pages + 1):
                page_data = fetch_haccp_page(page_no=page, num_of_rows=num_of_rows)
                
                if not page_data:
                    print(f"⏩ Page {page}: 수집된 데이터 없음 (건너뜀)")
                    continue

                # executemany를 활용한 고속 동시 업데이트
                cursor.executemany(update_sql, page_data)
                connection.commit()
                
                affected = cursor.rowcount
                updated_total += affected
                print(f"✅ [{page}/{total_pages} 페이지] 수집: {len(page_data)}건 | DB 실질 반영(UPDATE): {affected}건")

        print(f"\n🎉 벌크 업데이트가 완료되었습니다! 총 {updated_total}개 품목의 image_url이 DB에 갱신되었습니다.")

    except Exception as e:
        print(f"⚠️ DB 연결 및 업데이트 오류: {e}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

if __name__ == '__main__':
    # 100개씩 150페이지(약 15,000건) 수집 후 DB 업데이트 실행
    run_bulk_update(total_pages=150, num_of_rows=100)