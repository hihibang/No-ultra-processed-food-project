import {
  QuickActionButton,
  QuickActionLabel,
  QuickActionRow,
  QuickActions,
} from './styles/Chatbot.styles';

// 레시피 추천 직후 메시지 하단에 노출되는 퀵 액션 버튼 (4개)
// ① 이 레시피에 대해 추가 질문하기 ② 다른 레시피 추천하기 ③ 이 레시피 저장하기 ④ 완전히 새로운 레시피 검색하기
function QuickActionBar({
  onAskDetail,
  onRegenerate,
  onSaveRecipe,
  isSaved,
  onNewSearch,
  disabled,
}) {
  return (
    <QuickActions>
      <QuickActionLabel>다음으로 무엇을 할까요?</QuickActionLabel>
      <QuickActionRow>
        <QuickActionButton type="button" onClick={onAskDetail} disabled={disabled}>
          💬 이 레시피에 대해 추가 질문하기
        </QuickActionButton>

        <QuickActionButton type="button" onClick={onRegenerate} disabled={disabled}>
          🍳 다른 레시피 추천하기
        </QuickActionButton>

        <QuickActionButton
          type="button"
          onClick={onSaveRecipe}
          disabled={disabled || isSaved}
        >
          {isSaved ? '✅ 보관함에 저장됨' : '💾 이 레시피 저장하기'}
        </QuickActionButton>

        <QuickActionButton type="button" onClick={onNewSearch} disabled={disabled}>
          🆕 완전히 새로운 레시피 검색하기
        </QuickActionButton>
      </QuickActionRow>
    </QuickActions>
  );
}

export default QuickActionBar;
