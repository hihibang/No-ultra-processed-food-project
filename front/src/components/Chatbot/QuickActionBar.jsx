import {
  QuickActionButton,
  QuickActionLabel,
  QuickActionRow,
  QuickActions,
} from './styles/Chatbot.styles';

// 레시피 추천 직후 메시지 하단에 노출되는 퀵 액션 버튼
// ① 추가 질문하기  ② 다른 후보 보기(이미 받은 검색 결과 사용)  ③ 새로운 레시피 검색
function QuickActionBar({ candidates, currentIndex, onAskDetail, onShowCandidate, onNewSearch, disabled }) {
  const otherCandidates = candidates
    .map((candidate, index) => ({ candidate, index }))
    .filter(({ index }) => index !== currentIndex);

  return (
    <QuickActions>
      <QuickActionLabel>다음으로 무엇을 할까요?</QuickActionLabel>
      <QuickActionRow>
        <QuickActionButton type="button" onClick={onAskDetail} disabled={disabled}>
          💬 이 레시피에 대해 추가 질문하기
        </QuickActionButton>

        {otherCandidates.map(({ candidate, index }) => (
          <QuickActionButton
            key={candidate.title + index}
            type="button"
            title={candidate.title}
            onClick={() => onShowCandidate(index)}
            disabled={disabled}
          >
            🔄 {index + 1}번 레시피 보기
          </QuickActionButton>
        ))}

        <QuickActionButton type="button" onClick={onNewSearch} disabled={disabled}>
          🆕 완전히 새로운 레시피 검색하기
        </QuickActionButton>
      </QuickActionRow>
    </QuickActions>
  );
}

export default QuickActionBar;
