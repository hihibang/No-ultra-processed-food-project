import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { getIcon } from '../../constants/icons';
import {
  CardWrapper,
  ImageWrapper,
  Badge,
  WishlistButton,
  CartButton,
  CardInfo,
  IngredientTags,
  IngredientTag,
  ProductName,
  ProductSub,
  PriceRow,
  OriginalPrice,
  CurrentPrice,
  Rating,
} from './styles/ProductCard.styles';

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

        <WishlistButton
          onClick={handleToggleWishlist}
          $isWished={inWishlist}
          aria-label="위시리스트 담기"
        >
          <svg
            viewBox="0 0 24 24"
            fill={inWishlist ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </WishlistButton>

        <CartButton onClick={handleAddToCart} aria-label="장바구니 담기">
          {getIcon('shoppingBag')}
        </CartButton>
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