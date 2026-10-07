import os
import re
import json

# 1. 경로 설정 (docker-compose의 ./data/recipe_docs 구조에 맞춤)
current_dir = os.path.dirname(os.path.abspath(__file__))
jsonl_path = os.path.join(current_dir, "recipe_train.jsonl")
docs_dir = os.path.join(current_dir, "data", "recipe_docs")
os.makedirs(docs_dir, exist_ok=True)

# 2. 동의어 사전 및 불필요 수식어 정의
SYNONYM_DICT = {
    '쇠고기': '소고기',
    '계란': '달걀',
    '닭살': '닭가슴살',
    '연두부': '두부',
    '순두부': '두부'
}

REMOVE_WORDS = [
    '데친', '구운', '삶은', '다진', '으깬', '갈은', '볶은', '튀긴', '숙성', '재운',
    '소스', '양념장', '양념', '드레싱', '육수', '용기', '반죽', '속', '풀국', '즙'
]

def clean_ingredients(raw_text):
    if not raw_text:
        return ""
    # 구분자(/, &, .)를 쉼표(,)로 통일
    text = re.sub(r'[/&.]', ',', str(raw_text))
    
    # 수식어 제거
    for word in REMOVE_WORDS:
        text = text.replace(word, '')
        
    # 토큰화 및 정규화
    raw_tokens = [t.strip() for t in text.split(',') if t.strip()]
    cleaned_tokens = []
    
    for token in raw_tokens:
        token = token.replace(" ", "")
        token = SYNONYM_DICT.get(token, token)
        if len(token) > 1: # 1글자 노이즈 제거
            cleaned_tokens.append(token)
            
    # 중복 제거 후 쉼표 구분 문자열 반환
    return ", ".join(list(dict.fromkeys(cleaned_tokens)))

def sanitize_filename(name):
    """파일명 특수문자 제거"""
    return re.sub(r'[\/*?:"<>| ]', '_', str(name))

def main():
    if not os.path.exists(jsonl_path):
        print(f"[오류] {jsonl_path} 파일이 존재하지 않습니다.")
        return

    count = 0
    with open(jsonl_path, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip():
                continue
            entry = json.loads(line)
            recipe_data = json.loads(entry['output'])
            
            # 재료 전처리 한 번에 진행
            if 'ingredients' in recipe_data:
                recipe_data['ingredients'] = clean_ingredients(recipe_data['ingredients'])
            
            recipe_id = recipe_data.get('recipe_id', count)
            title = recipe_data.get('recipe_title', f"recipe_{count}")
            safe_name = sanitize_filename(title)
            
            # data/recipe_docs/ 위치에 정제된 개별 JSON 파일 저장
            file_path = os.path.join(docs_dir, f"{recipe_id}_{safe_name}.json")
            with open(file_path, 'w', encoding='utf-8') as out_f:
                json.dump(recipe_data, out_f, ensure_ascii=False, indent=2)
                
            count += 1

    print(f"[완료] 총 {count}개 레시피가 전처리되어 {docs_dir} 폴더에 저장되었습니다!")

if __name__ == "__main__":
    main()