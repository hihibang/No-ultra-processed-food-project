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
  EmptyText,
  Layout,
  Page,
  PageDesc,
  PageHeader,
  PageTitle,
  Sidebar,
  TextButton,
} from '../components/Chatbot/styles/Chatbot.styles';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { requestFollowup, requestRecipe, requestRecipeDetail } from '../api/chatbotApi';
import { chatSessionApi } from '../api/chatSessionApi';
import { mypageApi } from '../api/mypageApi';
import {
  appendToSession,
  buildProfileFromUser,
  clearLegacySessions,
  createId,
  dropMessageFromSession,
  loadChatProfile,
  saveChatProfile,
  updateSessionMessage,
} from '../utils/chatStorage';
import { extractRecipeTitle, findOriginalQuestion } from '../utils/chatRecipe';

const DEFAULT_ERROR = '답변을 받아오지 못했습니다. 잠시 후 다시 시도해 주세요.';
const QUESTION_MAX_LENGTH = 1000;
const EXHAUSTED_MESSAGE = '준비된 맞춤 레시피를 모두 추천해 드렸어요! 새로운 재료를 입력해 보실래요?';

// 가장 최근에 화면에 표시된 추천 레시피 메시지 (후속 질문의 맥락이 된다)
const findLatestRecipe = (messages) =>
  [...messages].reverse().find(m => m.role === 'assistant' && m.kind === 'recipe') ?? null;

function AIChatPage() {
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const inputRef = useRef(null);

  // 대화 목록: 로그인 사용자는 서버 값, 비로그인 사용자는 화면 메모리 값만 사용한다 (브라우저 저장 없음)
  const [sessions, setSessions] = useState([]);
  const sessionsRef = useRef(sessions);
  // 서버 요청(저장/삭제)을 보낸 순서대로 하나씩 처리해 저장과 삭제가 뒤섞이지 않게 한다
  const serverQueueRef = useRef(Promise.resolve());

  const [activeId, setActiveId] = useState(null);
  const [profile, setProfile] = useState(() => loadChatProfile() ?? buildProfileFromUser(user));
  const [showProfile, setShowProfile] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // 현재 대화창의 추천 레시피 후보군 캐시 (퀵 액션 ③에서 검색 없이 다음 후보를 꺼내 쓴다)
  // { sessionId, cachedRecipes, recipeIndex } — 대화를 나가거나 새 검색어를 입력하면 초기화한다
  const [recipeCache, setRecipeCache] = useState(null);

  // 상태 갱신과 ref 동기화를 함께 한다. 비동기 흐름에서도 최신 목록을 읽기 위함
  const commitSessions = (next) => {
    sessionsRef.current = next;
    setSessions(next);
  };

  const enqueueServerTask = (task) => {
    const run = serverQueueRef.current.then(task);
    serverQueueRef.current = run.catch(() => {});
    return run;
  };

  // 로그인 사용자의 세션을 서버에 반영한다 (비로그인은 아무것도 하지 않음)
  const persistSession = (sessionId) => {
    if (!isLoggedIn) return Promise.resolve();
    const target = sessionsRef.current.find(s => s.id === sessionId);
    if (!target) return Promise.resolve();
    return enqueueServerTask(() => chatSessionApi.save(target.id, {
      title: target.title,
      messages: target.messages,
    })).catch(() => showToast('대화 기록을 서버에 저장하지 못했습니다.', 'error'));
  };

  useEffect(() => { saveChatProfile(profile); }, [profile]);

  // 로그인 상태가 바뀔 때마다 대화 목록을 맞춘다. 이전 버전이 남긴 브라우저 대화 기록도 함께 지운다.
  useEffect(() => {
    clearLegacySessions();
    if (!isLoggedIn) {
      commitSessions([]);
      setActiveId(null);
      return undefined;
    }

    let cancelled = false;
    chatSessionApi.list()
      .then(list => {
        if (!cancelled) commitSessions(list);
      })
      .catch(err => {
        if (!cancelled) showToast(err.message, 'error');
      });
    return () => { cancelled = true; };
    // commitSessions는 렌더마다 새로 만들어지지만 상태를 바꾸기만 하므로 의존성에서 제외한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, showToast]);

  const activeSession = sessions.find(s => s.id === activeId) ?? null;
  const messages = activeSession?.messages ?? [];
  const lastMessage = messages[messages.length - 1] ?? null;

  // 현재 대화의 후보군 캐시를 돌려준다. 캐시가 없으면(새로고침·기록에서 다시 연 대화) 마지막 추천 메시지에 보관된 후보로 복원한다.
  const getActiveRecipeCache = () => {
    if (!activeId) return null;
    if (recipeCache?.sessionId === activeId) return recipeCache;
    const latest = findLatestRecipe(messages);
    if (!latest?.candidates?.length) return null;
    return { sessionId: activeId, cachedRecipes: latest.candidates, recipeIndex: latest.candidateIndex ?? 0 };
  };

  const resetToNewChat = () => {
    setActiveId(null);
    setInput('');
    setError('');
    setRecipeCache(null);
  };

  const handleSelect = (id) => {
    if (isLoading) return;
    setActiveId(id);
    setError('');
    setRecipeCache(null);
  };

  const handleDelete = async (id) => {
    if (isLoading) return;
    if (!window.confirm('이 대화 기록을 삭제할까요?')) return;

    if (isLoggedIn) {
      try {
        await enqueueServerTask(() => chatSessionApi.remove(id));
      } catch (err) {
        showToast(err.message, 'error');
        return;
      }
    }
    commitSessions(sessionsRef.current.filter(s => s.id !== id));
    if (id === activeId) {
      setActiveId(null);
      setRecipeCache(null);
    }
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
    commitSessions(appendToSession(sessionsRef.current, activeId, [message]));
    persistSession(activeId);
    inputRef.current?.focus();
  };

  // 퀵 액션 ③ 다른 레시피 추천하기: 검색을 다시 하지 않고, 저장된 후보군에서 다음 순번 레시피 1개의 조리법만 요청
  const handleRegenerate = () => {
    if (isLoading || !activeSession || lastMessage?.kind !== 'recipe') return;

    const cache = getActiveRecipeCache();
    if (!cache) {
      showToast('추천 후보 정보를 찾지 못해 다른 레시피를 보여드릴 수 없습니다.', 'error');
      return;
    }

    const { cachedRecipes } = cache;
    const nextIndex = cache.recipeIndex + 1;
    const sessionId = activeSession.id;

    // 후보를 모두 보여준 경우: API를 호출하지 않고 안내만 남긴다
    if (nextIndex >= cachedRecipes.length) {
      const message = {
        id: createId(),
        role: 'assistant',
        kind: 'exhausted',
        content: EXHAUSTED_MESSAGE,
        createdAt: new Date().toISOString(),
      };
      commitSessions(appendToSession(sessionsRef.current, sessionId, [message]));
      persistSession(sessionId);
      return;
    }

    runTurn({
      sessionId,
      isNewSession: false,
      history: messages,
      kind: 'detail',
      targetRecipe: cachedRecipes[nextIndex],
      userMessage: { id: createId(), role: 'user', kind: 'detail', content: '🍳 다른 레시피를 추천해 주세요', createdAt: new Date().toISOString() },
      fromInput: false,
      // 응답 레시피를 같은 후보군의 nextIndex 위치로 표시해 ② 후보 보기와 이어지게 한다
      candidateSet: { candidates: cachedRecipes, candidateIndex: nextIndex },
      // 요청이 성공했을 때만 현재 후보 위치를 옮긴다
      onSuccess: () => setRecipeCache({ sessionId, cachedRecipes, recipeIndex: nextIndex }),
    });
  };

  // 퀵 액션 ④ 이 레시피 저장하기: 현재 레시피를 마이페이지 레시피 보관함(mypage_logs)에 저장
  const handleSaveRecipe = async () => {
    if (isLoading || !activeSession || !lastMessage) return;
    if (!isLoggedIn) {
      showToast('로그인 후 레시피를 저장할 수 있습니다.', 'error');
      return;
    }
    if (lastMessage.savedLogId != null) return;

    const sessionId = activeSession.id;
    const target = lastMessage;
    const originalQuestion = findOriginalQuestion(messages, messages.length - 1);

    try {
      const saved = await mypageApi.saveRecipe({
        title: extractRecipeTitle(target.content),
        content: {
          markdown: target.content,
          question: originalQuestion ? originalQuestion.slice(0, QUESTION_MAX_LENGTH) : undefined,
          sourceSessionId: sessionId,
        },
      });
      commitSessions(updateSessionMessage(sessionsRef.current, sessionId, target.id, { savedLogId: saved.id }));
      await persistSession(sessionId);
      showToast('레시피 보관함에 저장했습니다.', 'success');
    } catch (err) {
      showToast(err.message || '레시피를 저장하지 못했습니다.', 'error');
    }
  };

  // 질문 1회 처리: 사용자 메시지 추가 → 추천/후속/다른 레시피 답변 요청 → 성공 시 답변 추가 및 서버 저장, 실패 시 되돌리기
  const runTurn = async ({
    sessionId,
    isNewSession,
    history,
    recipeContext,
    kind,
    question,
    targetRecipe,
    userMessage,
    fromInput = true,
    candidateSet = null,
    onSuccess,
  }) => {
    commitSessions(appendToSession(sessionsRef.current, sessionId, [userMessage], userMessage.createdAt));
    setActiveId(sessionId);
    if (fromInput) setInput('');
    setError('');
    setIsLoading(true);

    try {
      let result;
      if (kind === 'recipe') {
        result = await requestRecipe({ sessionId, question, profile });
      } else if (kind === 'detail') {
        result = await requestRecipeDetail({ sessionId, targetRecipe, profile });
      } else {
        result = await requestFollowup({ sessionId, question, recipeContext, history, profile });
      }

      const { answer, recipes } = result;
      const assistantMessage = {
        id: createId(),
        role: 'assistant',
        // 다른 레시피 답변도 추천 레시피로 취급해 퀵 액션이 다시 노출되게 한다
        kind: kind === 'detail' ? 'recipe' : kind,
        content: answer,
        createdAt: new Date().toISOString(),
        // 후보군을 메시지에 보관해 퀵 액션 ②와 새로고침 후 ③에서 사용한다
        ...(candidateSet ?? (recipes.length > 0 && { candidates: recipes, candidateIndex: 0 })),
      };
      commitSessions(appendToSession(sessionsRef.current, sessionId, [assistantMessage]));

      // 1차 추천 성공 시 후보군을 대화창 상태에 고정하고 첫 번째 후보(인덱스 0)부터 시작한다
      if (kind === 'recipe' && recipes.length > 0) {
        setRecipeCache({ sessionId, cachedRecipes: recipes, recipeIndex: 0 });
      }
      onSuccess?.();
      await persistSession(sessionId);
    } catch (err) {
      commitSessions(dropMessageFromSession(sessionsRef.current, sessionId, userMessage.id));
      if (isNewSession) setActiveId(null);
      if (fromInput) setInput(userMessage.content);
      setError(err.message || DEFAULT_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    const question = input.trim();
    if (!question || isLoading) return;

    // 후보 소진 안내 뒤의 입력은 '다른 재료'이므로 후속 질문이 아닌 새 검색으로 처리한다
    const needsNewSearch = lastMessage?.kind === 'exhausted';
    const recipe = needsNewSearch ? null : findLatestRecipe(messages);
    // 추천 이력이 없으면 1차 추천(n8n 벡터 검색), 있으면 후속 질문(로컬 서버 OpenAI)
    const kind = recipe ? 'followup' : 'recipe';
    // 새 검색어를 직접 입력하면 이전 후보군은 버린다 (성공 시 runTurn에서 새 후보군으로 채운다)
    if (kind === 'recipe') setRecipeCache(null);

    runTurn({
      sessionId: activeSession?.id ?? createId(),
      isNewSession: !activeSession,
      history: messages,
      recipeContext: recipe?.content,
      kind,
      question,
      userMessage: { id: createId(), role: 'user', kind, content: question, createdAt: new Date().toISOString() },
      fromInput: true,
    });
  };

  // 퀵 액션 ⑤ 완전히 새로운 레시피 검색: 입력창과 상태를 초기화하고 다음 질문부터 벡터 검색을 새로 실행
  const handleNewSearch = () => {
    if (isLoading) return;
    resetToNewChat();
    inputRef.current?.focus();
  };

  // 퀵 액션은 마지막 메시지가 추천 레시피일 때만 노출한다
  const showQuickActions = lastMessage?.role === 'assistant' && lastMessage?.kind === 'recipe';
  const quickActions = showQuickActions
    ? {
      isSaved: lastMessage.savedLogId != null,
      onAskDetail: handleAskDetail,
      onRegenerate: handleRegenerate,
      onSaveRecipe: handleSaveRecipe,
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
              {!isLoggedIn && (
                <EmptyText>
                  로그인하면 대화 기록이 저장되어 다시 볼 수 있어요. 로그인하지 않으면 페이지를 떠날 때 대화가 사라집니다.
                </EmptyText>
              )}
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
