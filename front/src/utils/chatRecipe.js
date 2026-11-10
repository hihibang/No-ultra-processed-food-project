// 챗봇 레시피 답변 보조 함수 (제목 추출, 원래 질문 찾기)

// 섹션 제목(### 재료 등)은 레시피 제목으로 쓰지 않는다
const SECTION_HEADINGS = new Set([
  '재료', '재료 준비', '준비물', '필요한 도구', '조리 순서', '조리순서', '조리 방법', '팁', '영양 정보', '영양정보',
]);
const DEFAULT_TITLE = '추천 레시피';
const MAX_TITLE_LENGTH = 40;

const stripMarkdown = (line) =>
  line
    .replace(/^#{1,6}\s*/, '')
    .replace(/^[-*]\s+/, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim();

// 답변 마크다운에서 레시피 제목을 뽑는다. 섹션 제목이 아닌 첫 제목 → 첫 본문 줄 순서로 본다.
export const extractRecipeTitle = (markdown) => {
  if (typeof markdown !== 'string' || markdown.trim() === '') return DEFAULT_TITLE;

  const lines = markdown.split('\n').map(line => line.trim()).filter(Boolean);
  const heading = lines.find(line => /^#{1,6}\s/.test(line) && !SECTION_HEADINGS.has(stripMarkdown(line)));
  const candidate = heading ?? lines.find(line => !/^#{1,6}\s/.test(line)) ?? '';

  const title = stripMarkdown(candidate);
  if (!title) return DEFAULT_TITLE;
  return title.length > MAX_TITLE_LENGTH ? `${title.slice(0, MAX_TITLE_LENGTH)}…` : title;
};

// recipeIndex 이전에서 이 레시피를 요청한 최근 질문을 찾는다
export const findOriginalQuestion = (messages, recipeIndex) => {
  for (let i = recipeIndex - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role === 'user' && message.kind === 'recipe') return message.content;
  }
  return null;
};
