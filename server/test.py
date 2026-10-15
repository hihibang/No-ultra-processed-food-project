import os
import pymysql
from dotenv import load_dotenv
from utils.upf_classifier import classify_food

load_dotenv()

DB_CONFIG = {
    'host': os.getenv("DB_HOST", "localhost"),
    'port': int(os.getenv("DB_PORT", 3306)),
    'user': os.getenv("DB_USER", "root"),
    'password': os.getenv("DB_PASSWORD", ""),
    'database': os.getenv("DB_NAME", "food_db"),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def inspect_all_nova1():
    print("🔍 NOVA 1 (자연/최소 가공) 판정 항목 전수(75개) 추출 중...\n")
    try:
        connection = pymysql.connect(**DB_CONFIG)
        nova1_list = []

        with connection.cursor() as cursor:
            sql = """
                SELECT 
                    report_no,
                    product_name,
                    product_type,
                    calories,
                    sugars,
                    sodium,
                    saturated_fat,
                    raw_materials,
                    image_url
                FROM active_food_catalog
                WHERE image_url IS NOT NULL AND image_url != '';
            """
            cursor.execute(sql)
            rows = cursor.fetchall()

            for food in rows:
                res = classify_food(food)
                if res["novaGroup"] == 1:
                    nova1_list.append((food, res))

        total_found = len(nova1_list)
        print(f"================ [ NOVA 1 판정 항목 전수 목록 (총 {total_found}건) ] ================\n")
        
        for idx, (food, res) in enumerate(nova1_list, 1):
            p_name = food['product_name']
            p_type = food['product_type']
            raws = food['raw_materials'] or '(비어있음/NULL)'
            cals = food['calories']
            sug = food['sugars']
            sod = food['sodium']
            
            print(f"[{idx}/{total_found}] {p_name} | 유형: {p_type}")
            print(f"    - 영양: {cals}kcal | 당류: {sug}g | 나트륨: {sod}mg")
            print(f"    - 원재료명: {raws}")
            print(f"    - 스코어/마커: score={res['upfScore']} | markers={res['detectedMarkers']}")
            print("-" * 80)

    except Exception as e:
        print(f"⚠️ 오류 발생: {e}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

if __name__ == '__main__':
    inspect_all_nova1()