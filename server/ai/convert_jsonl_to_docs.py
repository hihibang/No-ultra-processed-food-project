import os
import json
import re

# 현재 실행 위치(ai 폴더) 기준
current_dir = os.path.dirname(os.path.abspath(__file__))

# 1. data 폴더 경로 지정 및 자동 생성
data_dir = os.path.join(current_dir, "data")
os.makedirs(data_dir, exist_ok=True)

# 2. data/recipe_docs 폴더 경로 지정 및 생성
docs_dir = os.path.join(data_dir, "recipe_docs")
os.makedirs(docs_dir, exist_ok=True)

# jsonl 파일 경로 (현재 폴더에 있거나 data 폴더 안에 있는 경우 모두 대비)
jsonl_path = os.path.join(current_dir, "recipe_train.jsonl")
if not os.path.exists(jsonl_path):
    # data 폴더 안에 들어있는 경우 체크
    jsonl_path = os.path.join(data_dir, "recipe_train.jsonl")

def sanitize_filename(name):
    return re.sub(r'[\/*?:"<>| ]', '_', str(name))

def main():
    if not os.path.exists(jsonl_path):
        print(f"오류: {jsonl_path} 파일을 찾을 수 없습니다. (recipe_train.jsonl 위치를 확인하세요)")
        return

    count = 0
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            item = json.loads(line)
            data = json.loads(item["output"])

            r_id = data.get("recipe_id", count + 1)
            title = data.get("recipe_title", "레시피")
            safe_name = sanitize_filename(title)
            file_name = f"{r_id}_{safe_name}.md"
            file_path = os.path.join(docs_dir, file_name)

            content = f"""# 요리명: {title}

## 기본 정보
- 요리 분류: {data.get('recipe_type', '기타')}
- 조리 방식: {data.get('cooking_method', '기타')}
- 열량(칼로리): {data.get('calories', 0)} kcal
- 나트륨 함량: {data.get('sodium', 0)} mg

## 필요한 재료
{data.get('ingredients', '')}

## 조리 순서
{data.get('steps', '')}
"""
            with open(file_path, "w", encoding="utf-8") as out:
                out.write(content)
            count += 1

    print(f"[완료] 총 {count}개의 지식 문서 생성 완료: {docs_dir}")

if __name__ == "__main__":
    main()