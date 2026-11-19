import { useEffect, useState } from 'react';
import { recommendationApi, logInteraction } from '../../api/recommendationApi';
import InfluencerRecipeModal from './InfluencerRecipeModal';
import {
  Badge,
  BadgeRow,
  Card,
  CardGrid,
  CardName,
  CardSub,
  Section,
  SectionDesc,
  SectionTitle,
} from './styles/Recommendation.styles';

// 레시피 답변 아래 보조 영역: 내가 찜한 크리에이터 / 유사 취향 유저 픽 인플루언서 레시피
// 후보가 없거나 불러오지 못하면 아무것도 그리지 않는다 (제목·안내 문구 포함)
function InfluencerRecipeSection() {
  const [items, setItems] = useState([]);
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    let cancelled = false;
    recommendationApi.influencerRecipes({ limit: 2 })
      .then(result => { if (!cancelled) setItems(result.items ?? []); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, []);

  if (items.length === 0) return null;

  const handleOpen = (item) => {
    logInteraction({ itemType: 'influencer', itemId: item.creatorId, action: 'click', label: item.creatorName });
    setOpenItem(item);
  };

  return (
    <Section aria-label="인플루언서 레시피 추천">
      <SectionTitle>[크리에이터 레시피]</SectionTitle>
      <CardGrid>
        {items.map(item => (
          <Card key={`${item.source}-${item.recipeId}`} onClick={() => handleOpen(item)} style={{ cursor: 'pointer' }}>
            <CardName>{item.title}</CardName>
            <CardSub>{item.creatorName}</CardSub>
            <BadgeRow>
              <Badge>{item.badge}</Badge>
            </BadgeRow>
          </Card>
        ))}
      </CardGrid>
      <SectionDesc>크리에이터가 검수한 레시피만 보여드려요.</SectionDesc>

      <InfluencerRecipeModal
        recipeId={openItem?.recipeId ?? null}
        fallbackTitle={openItem?.title ?? ''}
        creatorName={openItem?.creatorName ?? ''}
        onClose={() => setOpenItem(null)}
      />
    </Section>
  );
}

export default InfluencerRecipeSection;
