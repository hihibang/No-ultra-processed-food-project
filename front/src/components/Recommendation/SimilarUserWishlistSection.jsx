import { useCart } from '../../hooks/useCart';
import { useWishlistToggle } from '../../hooks/useWishlistToggle';
import {
  BadgeRow,
  Card,
  CardGrid,
  CardName,
  CardSub,
  Section,
  SectionDesc,
  SectionTitle,
  SmallButton,
} from './styles/Recommendation.styles';

// 찜한 상품 한 줄: 이름을 누르면 상품 상세로, ❤️/🤍 버튼으로 바로 찜할 수 있다
function WishedItemRow({ item, onNavigate }) {
  const { isInWishlist } = useCart();
  const toggleWishlist = useWishlistToggle();
  const wished = isInWishlist(item.reportNo);

  return (
    <BadgeRow>
      <SmallButton type="button" onClick={() => onNavigate(item)}>{item.productName}</SmallButton>
      <SmallButton
        type="button"
        $solid={wished}
        onClick={() => toggleWishlist({ id: item.reportNo, name: item.productName, imageUrl: item.imageUrl })}
      >
        {wished ? '❤️' : '🤍'}
      </SmallButton>
    </BadgeRow>
  );
}

// 비교 상품군을 찜한 다른 유저들의 찜 리스트. 데이터가 없으면 섹션 전체를 그리지 않는다.
function SimilarUserWishlistSection({ cards, onNavigate }) {
  if (!cards || cards.length === 0) return null;

  return (
    <Section aria-label="유사 취향 유저 찜 리스트">
      <SectionTitle>👥 유사 취향 유저들의 찜 리스트 구경하기</SectionTitle>
      <CardGrid>
        {cards.map(card => (
          <Card key={card.userLabel}>
            <CardName>{card.userLabel}</CardName>
            <CardSub>
              '{card.matchedProductName}' 찜
              {card.scope === 'same_type' ? ' · 같은 유형 상품 기준' : ''}
            </CardSub>
            {card.wishedItems.map(item => (
              <WishedItemRow key={item.reportNo} item={item} onNavigate={onNavigate} />
            ))}
          </Card>
        ))}
      </CardGrid>
      <SectionDesc>실제로 찜한 데이터만 보여드려요.</SectionDesc>
    </Section>
  );
}

export default SimilarUserWishlistSection;
