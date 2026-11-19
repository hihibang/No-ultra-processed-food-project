import { useEffect, useState } from 'react';
import { recommendationApi } from '../../api/recommendationApi';
import {
  Badge,
  BadgeRow,
  Card,
  CardGrid,
  CardImage,
  CardName,
  CardSub,
  MutedText,
  Section,
  SectionDesc,
  SectionTitle,
  Tab,
  TabRow,
} from './styles/Recommendation.styles';

// ③ 팬덤 Cross-Domain 추천: 이 인플루언서(레시피)를 찜한 사람들이 함께 찜한 상품·레시피
function CrossDomainSection({ targetType, targetId, title = '이 인플루언서를 좋아하는 분들이 함께 찜한 상품 & 레시피' }) {
  const [state, setState] = useState({ status: 'loading', data: null });
  const [tab, setTab] = useState('products');

  useEffect(() => {
    if (!targetId) return undefined;
    let cancelled = false;
    setState({ status: 'loading', data: null });
    recommendationApi.crossDomain({ targetType, targetId })
      .then(data => { if (!cancelled) setState({ status: 'ready', data }); })
      .catch(() => { if (!cancelled) setState({ status: 'error', data: null }); });
    return () => { cancelled = true; };
  }, [targetType, targetId]);

  if (state.status === 'error') return null;

  const data = state.data;
  const isEmpty = data && data.products.length === 0 && data.recipes.length === 0;

  return (
    <Section aria-label={title}>
      <SectionTitle>[{title}]</SectionTitle>
      {data && (
        <SectionDesc>
          {data.strategy === 'fan_cf'
            ? `이 대상을 찜한 ${data.fanCount}명이 함께 찜한 항목이에요.`
            : '아직 함께 찜한 기록이 적어 인기 항목을 보여드려요.'}
        </SectionDesc>
      )}

      {state.status === 'loading' && <MutedText>함께 찜한 항목을 찾는 중...</MutedText>}
      {isEmpty && <MutedText>아직 보여줄 항목이 없어요.</MutedText>}

      {data && !isEmpty && (
        <>
          <TabRow>
            <Tab type="button" $active={tab === 'products'} onClick={() => setTab('products')}>
              상품 ({data.products.length})
            </Tab>
            <Tab type="button" $active={tab === 'recipes'} onClick={() => setTab('recipes')}>
              레시피 ({data.recipes.length})
            </Tab>
          </TabRow>

          {tab === 'products' && (
            data.products.length === 0
              ? <MutedText>함께 찜한 상품이 아직 없어요.</MutedText>
              : (
                <CardGrid>
                  {data.products.map(item => (
                    <Card key={item.reportNo}>
                      {item.imageUrl && <CardImage src={item.imageUrl} alt={item.productName} />}
                      <CardName>{item.productName}</CardName>
                      <CardSub>{item.companyName} · 건강 점수 {item.healthScore}점</CardSub>
                      <BadgeRow><Badge>👥 {item.fanWishCount}명이 함께 찜</Badge></BadgeRow>
                    </Card>
                  ))}
                </CardGrid>
              )
          )}

          {tab === 'recipes' && (
            data.recipes.length === 0
              ? <MutedText>함께 저장한 레시피가 아직 없어요.</MutedText>
              : (
                <CardGrid>
                  {data.recipes.map(recipe => (
                    <Card key={recipe.key}>
                      <CardName>{recipe.title}</CardName>
                      <BadgeRow><Badge>👥 {recipe.fanWishCount}명이 함께 저장</Badge></BadgeRow>
                    </Card>
                  ))}
                </CardGrid>
              )
          )}
        </>
      )}
    </Section>
  );
}

export default CrossDomainSection;
