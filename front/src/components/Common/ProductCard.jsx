import styled from 'styled-components';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';

const CardWrapper = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 146, 69, 0.1);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  background-color: ${({ theme }) => theme.colors.bgGray};
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  background-color: #dc2626;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  padding: 0.2rem 0.45rem;
  border-radius: 0.35rem;
  z-index: 5;
`;

const WishlistButton = styled.button`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 2rem;
  height: 2rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 6;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const CartButton = styled.button`
  position: absolute;
  bottom: 0.6rem;
  right: 0.6rem;
  width: 2.25rem;
  height: 2.25rem;
  background-color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 6;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }
`;

const CardInfo = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
`;

const IngredientTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
`;

const IngredientTag = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  background-color: #ecfdf5;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.15rem 0.45rem;
  border-radius: 0.3rem;
`;

const ProductName = styled.h3`
  font-size: 0.95rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  line-height: 1.3;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.textMain};
`;

const ProductSub = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSub};
  line-height: 1.3;
  margin: 0;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 0.75rem;
  padding-top: 0.65rem;
  border-top: 1px solid #f3f4f6;
`;

const OriginalPrice = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-decoration: line-through;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CurrentPrice = styled.span`
  font-size: 1.1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  color: ${({ theme }) => theme.colors.primary};
`;

const Rating = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: #f59e0b;
`;

function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { showToast } = useToast();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    showToast(`${product.name}이(가) 장바구니에 추가되었습니다.`, 'success');
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    showToast(
      inWishlist
        ? `${product.name}이(가) 위시리스트에서 제거되었습니다.`
        : `${product.name}이(가) 위시리스트에 추가되었습니다.`,
      'success'
    );
  };

  return (
    <CardWrapper>
      <ImageWrapper>
        <img src={product.image || '/images/div.relative.png'} alt={product.name} />
        {product.badge && <Badge>{product.badge}</Badge>}
        <WishlistButton onClick={handleToggleWishlist}>
          {inWishlist ? '❤️' : '🤍'}
        </WishlistButton>
        <CartButton onClick={handleAddToCart}>🛒</CartButton>
      </ImageWrapper>

      <CardInfo>
        {product.ingredients && product.ingredients.length > 0 && (
          <IngredientTags>
            {product.ingredients.map((ing, idx) => (
              <IngredientTag key={idx}>{ing}</IngredientTag>
            ))}
          </IngredientTags>
        )}

        <div>
          <ProductName>{product.name}</ProductName>
          {product.brand && <ProductSub>{product.brand}</ProductSub>}
        </div>

        <PriceRow>
          <div>
            {product.originalPrice && (
              <OriginalPrice>{product.originalPrice.toLocaleString()}원</OriginalPrice>
            )}
            <div>
              <CurrentPrice>{product.price.toLocaleString()}원</CurrentPrice>
            </div>
          </div>
          {product.rating && <Rating>⭐ {product.rating}</Rating>}
        </PriceRow>
      </CardInfo>
    </CardWrapper>
  );
}

export default ProductCard;
