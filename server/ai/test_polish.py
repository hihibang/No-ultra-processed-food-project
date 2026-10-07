import os
from dotenv import load_dotenv
import anthropic

# .env 파일 로드
load_dotenv()

api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError(".env 파일에 ANTHROPIC_API_KEY가 설정되어 있지 않습니다.")

client = anthropic.Anthropic(api_key=api_key)

# 1차 n8n (Qwen2.5:3b) 원본 레시피 초안 샘플
mock_n8n_raw_recipe = """필요한 재료:
주재료: 실비곱창 200g
부재료 및 양념: 마늘 5g, 대파 5g, 생강청 15g, 후추 1g, 참기름 3g, 올리고당 15g, 통깨 1g
■ 조리 순서:

[전처리 및 밑간]: 실비곱창을 깨끗이 씻어 손질합니다. 마늘과 대파를 갈아 양념을 만듭니다. 생강청과 후추를 섞어 소금에 절인 후, 참기름, 올리고당, 통깨를 추가하여 양념을 만들어냅니다.
[본 조리]: 팬이나 냄비에 양념이 담긴 물을 넣고 실비곱창을 넣습니다. 약불에서 10분간 볶아서 양념이 잘 들어갔음을 확인합니다.
[마무리 및 완성]: 실비곱창의 양념이 바삭하게 익으면, 냄비를 달군 후 양념을 실비곱창 위에 올려줍니다. 약불에서 2분간 더 볶아서 양념이 잘 고rap되어 완성된 실비곱창찜닭을 완성합니다."""

def polish_recipe(raw_text: str) -> str:
    system_prompt = """당신은 레시피 전문 에디터입니다.
전달받은 1차 레시피 초안에서 오타, 깨진 단어(예: "고rap되어"), 비문, 한자 표현, 부자연스러운 한국어 문장을 정갈한 표준 한국어로 교정하세요.

[교정 수칙]:
1. 재료 및 양념의 명칭과 수치 계량값은 절대로 변경하지 마세요.
2. 비문이나 어색한 표현(예: "양념이 바삭하게", "고rap되어" 등)은 요리 문맥에 맞게 매끄럽게 수정하세요.
3. 모든 조리 순서 문장은 '~합니다.' 스타일로 통일하세요.
4. 인사말이나 부연 설명 없이 교정된 레시피 본문만 깔끔하게 출력하세요."""

    # 최저 비용 및 고속 모델 지정
    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1000,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": f"[1차 레시피 초안]:\n{raw_text}"
                }
            ]
        )
        return message.content[0].text
    except Exception as e:
        print(f"API 호출 중 오류 발생: {e}")
        raise

if __name__ == "__main__":
    print("=== [1차 n8n 레시피 초안 (원본)] ===")
    print(mock_n8n_raw_recipe)
    print("\n" + "="*50 + "\n")
    
    print("=== [2차 백엔드 Claude 교정 결과] ===")
    polished_result = polish_recipe(mock_n8n_raw_recipe)
    print(polished_result)