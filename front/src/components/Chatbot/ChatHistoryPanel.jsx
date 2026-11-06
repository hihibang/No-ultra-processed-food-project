import {
  DeleteButton,
  EmptyText,
  HistoryButton,
  HistoryItem,
  HistoryList,
  HistoryMeta,
  HistoryTitle,
} from './styles/Chatbot.styles';

const formatDate = (value) =>
  new Date(value).toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// 저장된 대화 목록 (선택 시 해당 대화 열기, 삭제 가능)
function ChatHistoryPanel({ sessions, activeId, onSelect, onDelete, disabled }) {
  if (sessions.length === 0) {
    return <EmptyText>아직 저장된 대화가 없습니다.</EmptyText>;
  }

  return (
    <HistoryList>
      {sessions.map(session => (
        <HistoryItem key={session.id}>
          <HistoryButton
            type="button"
            $active={session.id === activeId}
            disabled={disabled}
            onClick={() => onSelect(session.id)}
          >
            <HistoryTitle>{session.title}</HistoryTitle>
            <HistoryMeta>
              {formatDate(session.updatedAt ?? session.createdAt)} · 메시지 {session.messages.length}개
            </HistoryMeta>
          </HistoryButton>
          <DeleteButton
            type="button"
            aria-label="대화 삭제"
            disabled={disabled}
            onClick={() => onDelete(session.id)}
          >
            ×
          </DeleteButton>
        </HistoryItem>
      ))}
    </HistoryList>
  );
}

export default ChatHistoryPanel;
