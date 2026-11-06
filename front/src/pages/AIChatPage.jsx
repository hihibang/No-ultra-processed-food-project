import { useEffect, useRef, useState } from 'react';
import MainContainer from '../components/Layout/MainContainer';
import Button from '../components/Common/Button';
import ChatbotProfileForm from '../components/Chatbot/ChatbotProfileForm';
import ChatHistoryPanel from '../components/Chatbot/ChatHistoryPanel';
import ChatWindow from '../components/Chatbot/ChatWindow';
import {
  Card,
  CardHeader,
  CardTitle,
  Layout,
  Page,
  PageDesc,
  PageHeader,
  PageTitle,
  Sidebar,
  TextButton,
} from '../components/Chatbot/styles/Chatbot.styles';
import { useAuth } from '../hooks/useAuth';
import { requestFollowup, requestRecipe } from '../api/chatbotApi';
import {
  appendToSession,
  buildProfileFromUser,
  createId,
  dropMessageFromSession,
  loadChatProfile,
  loadSessions,
  saveChatProfile,
  saveSessions,
} from '../utils/chatStorage';

const DEFAULT_ERROR = '답변을 받아오지 못했습니다. 잠시 후 다시 시도해 주세요.';

// 가장 최근에 화면에 표시된 추천 레시피 메시지 (후속 질문의 맥락이 된다)
const findLatestRecipe = (messages) =>
  [...messages].reverse().find(m => m.role === 'assistant' && m.kind === 'recipe') ?? null;

function AIChatPage() {
  const { user } = useAuth();
  const inputRef = useRef(null);

  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeId, setActiveId] = useState(null);
  const [profile, setProfile] = useState(() => loadChatProfile() ?? buildProfileFromUser(user));
  const [showProfile, setShowProfile] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { saveSessions(sessions); }, [sessions]);
  useEffect(() => { saveChatProfile(profile); }, [profile]);

  const activeSession = sessions.find(s => s.id === activeId) ?? null;
  const messages = activeSession?.messages ?? [];
  const lastMessage = messages[messages.length - 1] ?? null;

  const resetToNewChat = () => {
    setActiveId(null);
    setInput('');
    setError('');
  };

  const handleSelect = (id) => {
    if (isLoading) return;
    setActiveId(id);
    setError('');
  };

  const handleDelete = (id) => {
    if (isLoading) return;
    if (!window.confirm('이 대화 기록을 삭제할까요?')) return;
    setSessions(prev => prev.filter(s => s.id !== id));
    if (id === activeId) setActiveId(null);
  };

  const handleSyncProfile = () => {
    setProfile(prev => buildProfileFromUser(user, prev));
  };

  // 퀵 액션 ① 이 레시피에 대해 추가 질문하기: 챗봇이 질문을 받는 안내 메시지를 남기고 입력창으로 포커스
  // 안내 메시지에는 kind를 주지 않아 퀵 액션이 다시 노출되지 않으며, 다음 질문은 현재 레시피 기준 후속 질문이 된다.
  const handleAskDetail = () => {
    if (isLoading || !activeId) return;
    const message = {
      id: createId(),
      role: 'assistant',
      content: '네, 무슨 점이 궁금하신가요?',
      createdAt: new Date().toISOString(),
    };
    setSessions(prev => appendToSession(prev, activeId, [message]));
    inputRef.current?.focus();
  };

  // 퀵 액션 ② 다른 후보 보기: 추가 검색 없이 직전 검색 결과의 후보를 바로 표시
  const handleShowCandidate = (index) => {
    const recipe = findLatestRecipe(messages);
    const candidate = recipe?.candidates?.[index];
    if (!candidate || isLoading) return;

    const message = {
      id: createId(),
      role: 'assistant',
      kind: 'recipe',
      content: candidate.content,
      candidates: recipe.candidates,
      candidateIndex: index,
      createdAt: new Date().toISOString(),
    };
    setSessions(prev => appendToSession(prev, activeId, [message]));
  };

  // 퀵 액션 ③ 완전히 새로운 레시피 검색: 입력창과 상태를 초기화하고 다음 질문부터 벡터 검색을 새로 실행
  const handleNewSearch = () => {
    if (isLoading) return;
    resetToNewChat();
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const now = new Date().toISOString();
    const isNewSession = !activeSession;
    const sessionId = activeSession?.id ?? createId();
    const recipe = findLatestRecipe(messages);
    // 추천 이력이 없으면 1차 추천(n8n 벡터 검색), 있으면 후속 질문(로컬 서버 OpenAI)
    const kind = recipe ? 'followup' : 'recipe';

    const userMessage = { id: createId(), role: 'user', kind, content: question, createdAt: now };
    const historyBeforeSend = messages;

    // 질문을 먼저 저장해 두고, 실패하면 되돌린다
    setSessions(prev => appendToSession(prev, sessionId, [userMessage], now));
    setActiveId(sessionId);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const result = kind === 'recipe'
        ? await requestRecipe({ sessionId, question, profile })
        : await requestFollowup({
          sessionId,
          question,
          recipeContext: recipe.content,
          history: historyBeforeSend,
          profile,
        });

      const { answer, candidates } = result;
      const assistantMessage = {
        id: createId(),
        role: 'assistant',
        kind,
        content: answer,
        createdAt: new Date().toISOString(),
        // 1차 추천에서 받은 후보 목록을 보관해 퀵 액션 ②에서 추가 검색 없이 사용한다
        ...(candidates.length > 0 && { candidates, candidateIndex: 0 }),
      };
      setSessions(prev => appendToSession(prev, sessionId, [assistantMessage]));
    } catch (err) {
      setSessions(prev => dropMessageFromSession(prev, sessionId, userMessage.id));
      if (isNewSession) setActiveId(null);
      setInput(question);
      setError(err.message || DEFAULT_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  // 퀵 액션은 마지막 메시지가 추천 레시피일 때만 노출한다
  const showQuickActions = lastMessage?.role === 'assistant' && lastMessage?.kind === 'recipe';
  const quickActions = showQuickActions
    ? {
      candidates: lastMessage.candidates ?? [],
      currentIndex: lastMessage.candidateIndex ?? 0,
      onAskDetail: handleAskDetail,
      onShowCandidate: handleShowCandidate,
      onNewSearch: handleNewSearch,
    }
    : null;

  return (
    <MainContainer>
      <Page>
        <PageHeader>
          <div>
            <PageTitle>🤖 AI 맞춤형 레시피 챗봇</PageTitle>
            <PageDesc>
              주방 도구와 취향을 기반으로 레시피를 추천받고, 이어서 궁금한 점을 물어보세요.
            </PageDesc>
          </div>
          <Button variant="line" size="md" onClick={resetToNewChat} disabled={isLoading}>
            새 대화
          </Button>
        </PageHeader>

        <Layout>
          {/* 왼쪽: 대화 창 (채팅 영역 + 퀵 액션) */}
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            error={error}
            input={input}
            inputRef={inputRef}
            onInputChange={setInput}
            onSend={handleSend}
            quickActions={quickActions}
          />

          {/* 오른쪽: 내 취향 설정 · 대화 기록 사이드바 */}
          <Sidebar>
            <Card>
              <CardHeader>
                <CardTitle>내 취향 설정</CardTitle>
                <TextButton type="button" onClick={() => setShowProfile(prev => !prev)}>
                  {showProfile ? '접기' : '펼치기'}
                </TextButton>
              </CardHeader>
              {showProfile && (
                <>
                  <ChatbotProfileForm value={profile} onChange={setProfile} />
                  <TextButton type="button" onClick={handleSyncProfile} style={{ marginTop: '0.75rem' }}>
                    마이페이지 취향 불러오기
                  </TextButton>
                </>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>대화 기록</CardTitle>
              </CardHeader>
              <ChatHistoryPanel
                sessions={sessions}
                activeId={activeId}
                onSelect={handleSelect}
                onDelete={handleDelete}
                disabled={isLoading}
              />
            </Card>
          </Sidebar>
        </Layout>
      </Page>
    </MainContainer>
  );
}

export default AIChatPage;
