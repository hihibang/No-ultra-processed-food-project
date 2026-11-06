import { useEffect, useRef } from 'react';
import Button from '../Common/Button';
import {
  Bubble,
  BubbleMeta,
  ChatPanel,
  ErrorBanner,
  InputBar,
  KindTag,
  MessageArea,
  TextArea,
  WelcomeBox,
} from './styles/Chatbot.styles';

const KIND_LABEL = { recipe: '레시피 추천', followup: '후속 질문' };

// 대화 출력 영역 + 입력창
function ChatWindow({ messages, isLoading, error, input, onInputChange, onSend }) {
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
              {message.kind && <KindTag>{KIND_LABEL[message.kind]}</KindTag>}
            </BubbleMeta>
            {message.content}
          </Bubble>
        ))}

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
