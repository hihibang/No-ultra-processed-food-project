import os
import json

# 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
jsonl_path = os.path.join(current_dir, "recipe_train.jsonl")
docs_dir = os.path.join(current_dir, "data", "recipe_docs")
os.makedirs(docs_dir, exist_ok=True)

if not os.path.exists(jsonl_path):
    print(f"[오류] {jsonl_path} 파일이 존재하지 않습니다.")
    exit(1)

count = 0
error_count = 0

with open(jsonl_path, 'r', encoding='utf-8') as f:
    for line_num, line in enumerate(f, 1):
        if not line.strip():
            continue
        try:
            entry = json.loads(line)
            # inner output JSON 파싱
            recipe_data = json.loads(entry['output']) if isinstance(entry.get('output'), str) else entry.get('output', entry)
            
            recipe_id = recipe_data.get('recipe_id', count)
            file_path = os.path.join(docs_dir, f"{recipe_id}.json")
            
            # 개별 JSON 파일 저장 (추후 n8n 내 LLM이 읽어서 처리)
            with open(file_path, 'w', encoding='utf-8') as out_f:
                json.dump(recipe_data, out_f, ensure_ascii=False, indent=2)
                
            count += 1
        except Exception as e:
            print(f"[경고] {line_num}번째 라인 스킵: {e}")
            error_count += 1

print(f"[완료] 총 {count}개 레시피 분할 완료! (`{docs_dir}` 저장됨)")