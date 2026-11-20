import { useEffect, useState } from 'react';
import MainContainer from '../components/Layout/MainContainer';
import CrossDomainSection from '../components/Recommendation/CrossDomainSection';
import InfluencerRecipeModal from '../components/Recommendation/InfluencerRecipeModal';
import { recommendationApi } from '../api/recommendationApi';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  Badge,
  BadgeRow,
  CardGrid,
  CardName,
  CardSub,
  MutedText,
  Section,
  SectionDesc,
  SectionTitle,
  SmallButton,
} from '../components/Recommendation/styles/Recommendation.styles';
import {
  Container,
  PageTitle,
  PageSubtitle,
  PillRow,
  Pill,
  SelectableCard,
} from './styles/InfluencersPage.styles';

// /influencers: 인플루언서 목록·찜, 선택한 인플루언서의 레시피·추천 상품, 팬덤 추천
// 데이터가 없는 영역은 빈 안내 대신 섹션째로 숨긴다 (목록 자체가 비었을 때만 안내 문구)
function InfluencersPage() {
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [creators, setCreators] = useState({ status: 'loading', items: [] });
  const [selectedId, setSelectedId] = useState(null); // null = 전체 탭
  const [recipes, setRecipes] = useState({ status: 'loading', items: [] });
  const [openRecipe, setOpenRecipe] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    recommendationApi.influencers()
      .then(result => { if (!cancelled) setCreators({ status: 'ready', items: result.items ?? [] }); })
      .catch(() => { if (!cancelled) setCreators({ status: 'error', items: [] }); });
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  useEffect(() => {
    let cancelled = false;
    setRecipes(prev => ({ ...prev, status: 'loading' }));
    recommendationApi.influencerRecipes(selectedId ?? undefined)
      .then(result => { if (!cancelled) setRecipes({ status: 'ready', items: result.items ?? [] }); })
      .catch(() => { if (!cancelled) setRecipes({ status: 'error', items: [] }); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const items = creators.items;
  const selected = items.find(creator => creator.creatorId === selectedId) ?? null;
  const followed = items.filter(creator => creator.isFollowed);
  const community = items
    .filter(creator => !creator.isFollowed && creator.communityScore > 0)
    .sort((a, b) => b.communityScore - a.communityScore);

  const handleToggleFollow = async (creator) => {
    if (!isLoggedIn) {
      showToast('로그인 후 인플루언서를 찜할 수 있어요.', 'info');
      return;
    }
    setPendingId(creator.creatorId);
    try {
      const result = creator.isFollowed
        ? await recommendationApi.unfollowInfluencer(creator.creatorId)
        : await recommendationApi.followInfluencer(creator.creatorId);
      setCreators(prev => ({
        ...prev,
        items: prev.items.map(item => (item.creatorId === creator.creatorId ? { ...item, isFollowed: result.isFollowed } : item)),
      }));
    } catch (error) {
      showToast(error.message || '찜 상태를 바꾸지 못했습니다.', 'error');
    } finally {
      setPendingId(null);
    }
  };

  const renderCreatorCard = (creator, { active = false } = {}) => (
    <SelectableCard key={creator.creatorId} $active={active}>
      <CardName onClick={() => setSelectedId(creator.creatorId)} style={{ cursor: 'pointer' }}>
        {creator.avatar ? `${creator.avatar} ` : ''}{creator.name}
      </CardName>
      {creator.concept && <CardSub><strong>{creator.concept}</strong></CardSub>}
      {creator.bio && <CardSub>{creator.bio}</CardSub>}
      {creator.tags?.length > 0 && (
        <BadgeRow>{creator.tags.map(tag => <Badge key={tag}>#{tag}</Badge>)}</BadgeRow>
      )}
      <CardSub>레시피 {creator.recipeCount}개</CardSub>
      <BadgeRow>
        <SmallButton type="button" onClick={() => setSelectedId(creator.creatorId)}>레시피 보기</SmallButton>
        <SmallButton
          type="button"
          $solid={creator.isFollowed}
          disabled={pendingId === creator.creatorId}
          onClick={() => handleToggleFollow(creator)}
        >
          {creator.isFollowed ? '❤️ 찜함' : '🤍 찜하기'}
        </SmallButton>
      </BadgeRow>
    </SelectableCard>
  );

  return (
    <MainContainer>
      <Container>
        <PageTitle>인플루언서</PageTitle>
        <PageSubtitle>클린 식단·건강 레시피 크리에이터를 찜하고, 검수된 레시피와 함께 찜하는 상품을 모아보세요.</PageSubtitle>

        <Section aria-label="인플루언서 목록">
          <SectionTitle>크리에이터</SectionTitle>
          {creators.status === 'loading' && <MutedText>크리에이터를 불러오는 중입니다...</MutedText>}
          {creators.status === 'error' && <MutedText>크리에이터 목록을 불러오지 못했습니다.</MutedText>}
          {creators.status === 'ready' && items.length === 0 && (
            <MutedText>아직 등록된 인플루언서가 없어요.</MutedText>
          )}
          {items.length > 0 && (
            <>
              <PillRow>
                <Pill type="button" $active={selectedId === null} onClick={() => setSelectedId(null)}>전체</Pill>
              </PillRow>
              <CardGrid>
                {items.map(creator => renderCreatorCard(creator, { active: creator.creatorId === selectedId }))}
              </CardGrid>
            </>
          )}
        </Section>

        {followed.length > 0 && (
          <Section aria-label="내가 찜한 인플루언서">
            <SectionTitle>내가 찜한 인플루언서</SectionTitle>
            <CardGrid>{followed.map(creator => renderCreatorCard(creator, { active: creator.creatorId === selectedId }))}</CardGrid>
          </Section>
        )}

        {community.length > 0 && (
          <Section aria-label="취향 유사 유저가 찜한 인플루언서">
            <SectionTitle>👥 취향이 비슷한 유저들이 찜한 인플루언서</SectionTitle>
            <SectionDesc>나와 비슷한 취향의 유저들이 찜한 크리에이터예요.</SectionDesc>
            <CardGrid>{community.map(creator => renderCreatorCard(creator, { active: creator.creatorId === selectedId }))}</CardGrid>
          </Section>
        )}

        <Section aria-label="인플루언서 레시피">
          <SectionTitle>{selected ? `${selected.name}의 레시피` : '전체 인플루언서 레시피'}</SectionTitle>
          {recipes.status === 'loading' && <MutedText>레시피를 불러오는 중입니다...</MutedText>}
          {recipes.status === 'error' && <MutedText>레시피를 불러오지 못했습니다.</MutedText>}
          {recipes.status === 'ready' && recipes.items.length === 0 && (
            <MutedText>아직 검수된 레시피가 없어요.</MutedText>
          )}
          {recipes.status === 'ready' && recipes.items.length > 0 && (
            <CardGrid>
              {recipes.items.map(recipe => (
                <SelectableCard key={recipe.recipeId} onClick={() => setOpenRecipe(recipe)}>
                  <CardName>{recipe.title}</CardName>
                  <CardSub>{recipe.creatorName}</CardSub>
                  <BadgeRow><Badge>레시피 보기</Badge></BadgeRow>
                </SelectableCard>
              ))}
            </CardGrid>
          )}
        </Section>

        {selected && (
          <CrossDomainSection
            targetType="influencer"
            targetId={selected.creatorId}
            title={`${selected.name} 팬들이 함께 찜한 상품 & 레시피`}
          />
        )}
      </Container>

      <InfluencerRecipeModal
        recipeId={openRecipe?.recipeId ?? null}
        fallbackTitle={openRecipe?.title ?? ''}
        creatorName={openRecipe?.creatorName ?? ''}
        onClose={() => setOpenRecipe(null)}
      />
    </MainContainer>
  );
}

export default InfluencersPage;
