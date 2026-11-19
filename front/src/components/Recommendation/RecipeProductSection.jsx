import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationApi } from '../../api/recommendationApi';
import { useCart } from '../../hooks/useCart';
import { useWishlistToggle } from '../../hooks/useWishlistToggle';
import { productDetailPath } from '../../utils/product';
import SmartCompareModal from './SmartCompareModal';
import {
  Badge,
  BadgeRow,
  Card,
  CardGrid,
  CardImage,
  CardName,
  CardSub,
  Section,
  SectionDesc,
  SectionTitle,
  SmallButton,
} from './styles/Recommendation.styles';

// ① 챗봇 추천 답변 카드 하단: 이 요리에 맞는 상품 (찜한 재료 · 유사 취향 Pick 배지)
function RecipeProductSection({ recipeTitle, ingredients }) {
  const { isInWishlist } = useCart();
  const toggleWishlist = useWishlistToggle();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', items: [] });
  const [compareTarget, setCompareTarget] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', items: [] });
    recommendationApi.recipeProducts({ recipeTitle, ingredients })
      .then(result => { if (!cancelled) setState({ status: 'ready', items: result.items }); })
      .catch(() => { if (!cancelled) setState({ status: 'error', items: [] }); });
    return () => { cancelled = true; };
  }, [recipeTitle, ingredients]);

  // 로딩 중·에러·추천 0개면 제목과 안내 문구까지 전부 숨긴다
  if (state.status !== 'ready' || state.items.length === 0) return null;

  return (
    <Section aria-label="이 요리에 딱 맞는 추천 상품">
      <SectionTitle>[이 요리에 딱 맞는 추천 상품]</SectionTitle>
      <CardGrid>
          {state.items.map(item => {
            const wished = isInWishlist(item.reportNo);
            return (
              <Card key={item.reportNo}>
                {item.imageUrl && (
                  <CardImage
                    src={item.imageUrl}
                    alt={item.productName}
                    onClick={() => navigate(productDetailPath(item.reportNo))}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                <CardName
                  onClick={() => navigate(productDetailPath(item.reportNo))}
                  style={{ cursor: 'pointer' }}
                >
                  {item.productName}
                </CardName>
                <CardSub>{item.companyName} · 건강 점수 {item.healthScore}점</CardSub>
                <BadgeRow>
                  {item.badges.map(label => <Badge key={label}>{label}</Badge>)}
                </BadgeRow>
                <BadgeRow>
                  <SmallButton
                    type="button"
                    $solid={wished}
                    onClick={() => toggleWishlist({ id: item.reportNo, name: item.productName, imageUrl: item.imageUrl })}
                  >
                    {wished ? '❤️ 찜함' : '🤍 찜하기'}
                  </SmallButton>
                  <SmallButton type="button" onClick={() => setCompareTarget(item)}>
                    🔄 비슷한 상품 비교
                  </SmallButton>
                </BadgeRow>
              </Card>
            );
          })}
      </CardGrid>
      <SectionDesc>재료명과 맞는 상품 중에서 찜·취향 데이터와 건강 점수로 골랐어요.</SectionDesc>

      <SmartCompareModal
        isOpen={Boolean(compareTarget)}
        productId={compareTarget?.reportNo}
        productName={compareTarget?.productName}
        onClose={() => setCompareTarget(null)}
      />
    </Section>
  );
}

export default RecipeProductSection;
