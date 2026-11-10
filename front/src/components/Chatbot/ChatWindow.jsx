import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Button from '../Common/Button';
import QuickActionBar from './QuickActionBar';
import {
  Bubble,
  BubbleMeta,
  ChatPanel,
  ErrorBanner,
  InputBar,
  KindTag,
  MarkdownBody,
  MessageArea,
  TextArea,
  WelcomeBox,
} from './styles/Chatbot.styles';

// 답변 종류별 라벨. kind가 없는 어시스턴트 메시지는 '안내'로 통일한다.
const KIND_LABEL = { recipe: '레시피 추천', followup: '후속 질문' };
const GUIDE_LABEL = '안내';

// 대화 출력 영역 + 퀵 액션 + 입력창
function ChatWindow({
  messages,
  isLoading,
  error,
  input,
  inputRef,
  onInputChange,
  onSend,
  quickActions,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isLoading]);

  const handleKeyDown = (e) => {
    // 한글 조합 중 Enter는 전송하지 않는다
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <ChatPanel>
      <MessageArea>
        {messages.length === 0 && !isLoading && (
          <WelcomeBox>
            보유한 주방 도구와 취향을 설정한 뒤 질문해 보세요.
            <br />
            예: &ldquo;냉장고에 두부랑 대파만 있어요. 저녁 뭐 해먹지?&rdquo;
          </WelcomeBox>
        )}

        {messages.map(message => (
          <Bubble key={message.id} $role={message.role}>
            <BubbleMeta>
              {message.role === 'user' ? '나' : 'AI'}
              {message.role === 'user' && message.kind && <KindTag>{KIND_LABEL[message.kind]}</KindTag>}
              {message.role === 'assistant' && <KindTag>{KIND_LABEL[message.kind] ?? GUIDE_LABEL}</KindTag>}
              {message.candidateIndex != null && (
                <KindTag>후보 {message.candidateIndex + 1}번</KindTag>
              )}
            </BubbleMeta>
            {message.role === 'assistant' ? (
              <MarkdownBody>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </MarkdownBody>
            ) : (
              message.content
            )}
          </Bubble>
        ))}

        {quickActions && !isLoading && (
          <QuickActionBar
            candidates={quickActions.candidates}
            currentIndex={quickActions.currentIndex}
            onAskDetail={quickActions.onAskDetail}
            onShowCandidate={quickActions.onShowCandidate}
            onRegenerate={quickActions.onRegenerate}
            onSaveRecipe={quickActions.onSaveRecipe}
            isSaved={quickActions.isSaved}
            onNewSearch={quickActions.onNewSearch}
            disabled={isLoading}
          />
        )}

        {isLoading && (
          <Bubble $role="assistant">
            <BubbleMeta>AI</BubbleMeta>
            답변을 준비하고 있어요…
          </Bubble>
        )}

        {error && <ErrorBanner role="alert">{error}</ErrorBanner>}
        <div ref={bottomRef} />
      </MessageArea>

      <InputBar>
        <TextArea
          ref={inputRef}
          rows={2}
          value={input}
          disabled={isLoading}
          placeholder="질문을 입력하세요. (Enter 전송, Shift+Enter 줄바꿈)"
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          variant="primary"
          size="md"
          onClick={onSend}
          disabled={isLoading || input.trim() === ''}
        >
          전송
        </Button>
      </InputBar>
    </ChatPanel>
  );
}

export default ChatWindow;
