import { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
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
  AddToCartButton,
  WishlistButton,
  IngredientsList,
  ComparisonSection,
} from './styles/ProductDetailModal.styles';

function ProductDetailModal({ product, isOpen, onClose }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const inWishlist = isInWishlist(product?.id);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, quantity });
    showToast(`${product.name}이(가) 장바구니에 추가되었습니다.`, 'success');
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist(product);
    showToast(
      inWishlist
        ? `${product.name}이(가) 위시리스트에서 제거되었습니다.`
        : `${product.name}이(가) 위시리스트에 추가되었습니다.`,
      'success'
    );
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: '50px',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  +
                </button>
              </div>

              <AddToCartButton onClick={handleAddToCart}>
                {getIcon('shoppingBag')}
                장바구니 추가
              </AddToCartButton>

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
