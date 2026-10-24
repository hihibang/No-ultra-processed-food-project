import { useCart } from '../../hooks/useCart';
import { useWishlistToggle } from '../../hooks/useWishlistToggle';
import { getProductId } from '../../utils/product';
import { getIcon } from '../../constants/icons';
import NovaAnalysisChip from './NovaAnalysisChip';
import ComparisonTable from './ComparisonTable';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  ImageSection,
  DetailsSection,
  ProductName,
  ProductBrand,
  PriceSection,
  OriginalPrice,
  CurrentPrice,
  RatingBadge,
  DescriptionText,
  BadgesRow,
  Badge,
  ActionButtons,
  WishlistButton,
  IngredientsList,
  ComparisonSection,
} from './styles/ProductDetailModal.styles';

function ProductDetailModal({ product, isOpen, onClose }) {
  const { isInWishlist } = useCart();
  const toggleWishlist = useWishlistToggle();

  const inWishlist = isInWishlist(getProductId(product));

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist(product);
  };

  if (!isOpen || !product) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{product.name}</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>

        <ModalBody>
          <ImageSection>
            <img src={product.image || '/images/div.relative.png'} alt={product.name} />
            {product.badge && <Badge className="badge">{product.badge}</Badge>}
          </ImageSection>

          <DetailsSection>
            <ProductBrand>{product.brand || '브랜드 정보 없음'}</ProductBrand>

            <PriceSection>
              {product.originalPrice && (
                <OriginalPrice>{product.originalPrice.toLocaleString()}원</OriginalPrice>
              )}
              <CurrentPrice>{product.price.toLocaleString()}원</CurrentPrice>
              {product.rating && <RatingBadge>⭐ {product.rating}</RatingBadge>}
            </PriceSection>

            {product.description && (
              <DescriptionText>{product.description}</DescriptionText>
            )}

            {product.ingredients && product.ingredients.length > 0 && (
              <>
                <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>주요 성분</h3>
                <IngredientsList>
                  {product.ingredients.map((ing, idx) => (
                    <Badge key={idx}>{ing}</Badge>
                  ))}
                </IngredientsList>
              </>
            )}

            {/* NOVA 성분 분석 섹션 */}
            {product.novaGrade && (
              <NovaAnalysisChip
                novaGrade={product.novaGrade}
                badges={[
                  product.lowSugar && { type: 'low-sugar', icon: '🍬', label: '저당' },
                  product.highProtein && { type: 'high-protein', icon: '💪', label: '고단백' },
                  product.noAdditive && { type: 'no-additive', icon: '✓', label: '무첨가' },
                ].filter(Boolean)}
                shefNote={product.shefNote || ''}
              />
            )}

            {/* 유사 상품 비교 섹션 */}
            {product.similarProduct && (
              <ComparisonTable
                currentProduct={product}
                similarProduct={product.similarProduct}
                pingPongTip={product.pingPongTip || ''}
              />
            )}

            <ActionButtons>
              <WishlistButton onClick={handleToggleWishlist} $isWished={inWishlist}>
                {getIcon('heart')}
              </WishlistButton>
            </ActionButtons>
          </DetailsSection>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
}

export default ProductDetailModal;
