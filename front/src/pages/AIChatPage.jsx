import { useEffect, useState } from 'react';
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

function AIChatPage() {
  const { user } = useAuth();

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

  const handleNewChat = () => {
    if (isLoading) return;
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

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const now = new Date().toISOString();
    const isNewSession = !activeSession;
    const sessionId = activeSession?.id ?? createId();
    const recipeMessage = messages.find(m => m.kind === 'recipe' && m.role === 'assistant');
    // 추천 이력이 없으면 1차 추천, 있으면 후속 질문
    const kind = recipeMessage ? 'followup' : 'recipe';

    const userMessage = { id: createId(), role: 'user', kind, content: question, createdAt: now };
    const historyBeforeSend = messages;

    // 질문을 먼저 저장해 두고, 실패하면 되돌린다
    setSessions(prev => appendToSession(prev, sessionId, [userMessage], now));
    setActiveId(sessionId);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const answer = kind === 'recipe'
        ? await requestRecipe({ sessionId, question, profile })
        : await requestFollowup({
          sessionId,
          question,
          recipeContext: recipeMessage.content,
          history: historyBeforeSend,
        });

      const assistantMessage = {
        id: createId(),
        role: 'assistant',
        kind,
        content: answer,
        createdAt: new Date().toISOString(),
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
          <Button variant="line" size="md" onClick={handleNewChat} disabled={isLoading}>
            새 대화
          </Button>
        </PageHeader>

        <Layout>
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

          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            error={error}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
          />
        </Layout>
      </Page>
    </MainContainer>
  );
}

export default AIChatPage;
