import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { recommendationApi, logInteraction } from '../../api/recommendationApi';
import { useAuth } from '../../hooks/useAuth';
import { MarkdownBody } from '../Chatbot/styles/Chatbot.styles';
import {
  Badge,
  BadgeRow,
  Card,
  CardGrid,
  CardName,
  CardSub,
  MarkdownBox,
  MutedText,
  Section,
  SectionDesc,
  SectionTitle,
  SmallButton,
} from './styles/Recommendation.styles';

// ② 나와 취향·주방이 비슷한 유저들이 저장한 레시피 (로그인 사용자 전용)
// onAskChat: 챗봇 입력창에 질문을 채워 넣는다 (홈에서는 챗봇 페이지로 이동)
function SimilarUserRecipesSection({ onAskChat }) {
  const { isLoggedIn } = useAuth();
  const [state, setState] = useState({ status: 'idle', items: [], strategy: null });
  const [openKey, setOpenKey] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) return undefined;
    let cancelled = false;
    setState({ status: 'loading', items: [], strategy: null });
    recommendationApi.similarUserRecipes()
      .then(result => { if (!cancelled) setState({ status: 'ready', items: result.items, strategy: result.strategy }); })
      .catch(() => { if (!cancelled) setState({ status: 'error', items: [], strategy: null }); });
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  if (!isLoggedIn || state.status === 'error' || state.status === 'idle') return null;

  const handleToggleDetail = (recipe) => {
    const nextOpen = openKey === recipe.key ? null : recipe.key;
    setOpenKey(nextOpen);
    if (nextOpen) logInteraction({ itemType: 'recipe', itemId: recipe.key, action: 'view', label: recipe.title });
  };

  return (
    <Section aria-label="나와 취향이 비슷한 유저들이 저장한 레시피">
      <SectionTitle>[나와 취향·주방이 비슷한 유저들이 저장한 레시피]</SectionTitle>
      <SectionDesc>
        {state.strategy === 'popular'
          ? '아직 비슷한 취향의 데이터가 적어 많이 저장된 레시피를 먼저 보여드려요.'
          : '주방 도구, 선호 요리, 저장·찜 기록이 비슷한 유저 기준으로 골랐어요.'}
      </SectionDesc>

      {state.status === 'loading' && <MutedText>추천 레시피를 불러오는 중...</MutedText>}
      {state.status === 'ready' && state.items.length === 0 && (
        <MutedText>아직 추천할 레시피가 없어요. 챗봇에 레시피를 물어보고 저장해 보세요.</MutedText>
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <CardGrid>
          {state.items.map(recipe => (
            <Card key={recipe.key}>
              <CardName>{recipe.title}</CardName>
              <BadgeRow>
                {recipe.badges.map(label => <Badge key={label}>{label}</Badge>)}
                {recipe.matchRate !== null && <Badge>일치율 {recipe.matchRate}%</Badge>}
              </BadgeRow>
              <CardSub>{recipe.reason}</CardSub>
              <BadgeRow>
                {recipe.markdown && (
                  <SmallButton type="button" onClick={() => handleToggleDetail(recipe)}>
                    {openKey === recipe.key ? '접기' : '📖 상세 보기'}
                  </SmallButton>
                )}
                {onAskChat && (
                  <SmallButton
                    type="button"
                    $solid
                    onClick={() => onAskChat(`"${recipe.title}" 레시피를 내 주방 도구에 맞게 자세히 알려줘.`)}
                  >
                    💬 챗봇에 물어보기
                  </SmallButton>
                )}
              </BadgeRow>
              {openKey === recipe.key && recipe.markdown && (
                <MarkdownBox>
                  <MarkdownBody>
                    <ReactMarkdown>{recipe.markdown}</ReactMarkdown>
                  </MarkdownBody>
                </MarkdownBox>
              )}
            </Card>
          ))}
        </CardGrid>
      )}
    </Section>
  );
}

export default SimilarUserRecipesSection;
