import os
import re
import json
import pymysql
from dotenv import load_dotenv

# 1. 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '.env')
if not os.path.exists(env_path):
    env_path = os.path.join(current_dir, '..', '.env')

load_dotenv(dotenv_path=env_path)

# 개별 JSON을 저장할 폴더 생성 (ai/json/)
json_dir = os.path.join(current_dir, "json")
os.makedirs(json_dir, exist_ok=True)

# 2. DB 연결 정보
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def clean_filename(name):
    """파일명으로 쓸 수 없는 특수문자 제거"""
    return re.sub(r'[\/*?:"<>| ]', '_', str(name))

def main():
    if not DB_CONFIG['database']:
        raise ValueError("DB_NAME이 .env에 설정되지 않았습니다.")

    connection = pymysql.connect(**DB_CONFIG)
    jsonl_output_path = os.path.join(current_dir, "recipe_train.jsonl")
    count = 0

    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT 
                    recipe_id,
                    menu_name,
                    cooking_method,
                    recipe_type,
                    ingredients,
                    cooking_steps_desc,
                    calories,
                    sodium
                FROM recipe
                WHERE ingredients IS NOT NULL 
                  AND cooking_steps_desc IS NOT NULL;
            """
            cursor.execute(sql)
            rows = cursor.fetchall()

        # 학습용 통합 JSONL 파일 오픈
        with open(jsonl_output_path, "w", encoding="utf-8") as jsonl_f:
            for row in rows:
                recipe_id = row['recipe_id']
                menu_name = str(row['menu_name']).strip()

                # DB 데이터 구조화
                recipe_data = {
                    "recipe_id": recipe_id,
                    "recipe_title": menu_name,
                    "recipe_type": row.get('recipe_type') or "기타",
                    "cooking_method": row.get('cooking_method') or "기타",
                    "ingredients": str(row['ingredients']).strip(),
                    "steps": str(row['cooking_steps_desc']).strip(),
                    "calories": float(row['calories']) if row.get('calories') else 0.0,
                    "sodium": float(row['sodium']) if row.get('sodium') else 0.0
                }

                # 1) ai/json/ 폴더에 개별 JSON 파일 저장 (확인/수정용)
                safe_name = clean_filename(menu_name)
                individual_file_path = os.path.join(json_dir, f"{recipe_id}_{safe_name}.json")
                with open(individual_file_path, "w", encoding="utf-8") as ind_f:
                    json.dump(recipe_data, ind_f, ensure_ascii=False, indent=2)

                # 2) Bllossom-8B 학습용 단일 JSONL에 한 줄 추가 (input / output 구조)
                entry = {
                    "input": menu_name,
                    "output": json.dumps(recipe_data, ensure_ascii=False)
                }
                jsonl_f.write(json.dumps(entry, ensure_ascii=False) + "\n")
                
                count += 1

        print(f"[완료] 총 {count}개 레시피 처리 완료:")
        print(f" - 개별 JSON 저장 위치: {json_dir}/ (예: 1_버섯볶음.json)")
        print(f" - 파인튜닝용 파일: {jsonl_output_path}")

    finally:
        connection.close()

if __name__ == "__main__":
    main()