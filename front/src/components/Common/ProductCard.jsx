import React from 'react';
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

// DB product_type(세부유형)을 기반으로 UI 대분류 카테고리를 찾아주는 헬퍼 함수
const getMainCategory = (subType) => {
  if (!subType) return '';
  if (['빵류'].includes(subType)) return '베이커리';
  if (['음료베이스', '액상차', '커피', '혼합음료', '과.채주스', '과.채음료', '탄산음료'].includes(subType)) return '음료/티';
  if (['초콜릿', '초콜릿가공품', '빙과', '과자', '캔디류'].includes(subType)) return '디저트/스낵';
  if (['어묵', '식육함유가공품'].includes(subType)) return '신선식품';
  if (['즉석조리식품', '즉석섭취식품', '간편조리세트', '만두', '숙면', '유탕면'].includes(subType)) return '간편식';
  if (['소스', '복합조미식품'].includes(subType)) return '소스/양념';
  return '';
};

function ProductCard({ product, onClick }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { showToast } = useToast();

  // 1. product 객체가 없을 때 안전 리턴
  if (!product) return null;

  // 2. 데이터 전체 방어 파싱 (백엔드 / 프론트 필드명 상호 호환)
  const id = product.id ?? product.reportNo ?? '';
  const name = product.name ?? product.productName ?? '상품명 정보 없음';
  const brand = product.company ?? product.companyName ?? product.brand ?? '';
  const category = product.category ?? product.foodCategory ?? '';
  const price = product.price ?? 0;
  const originalPrice = product.originalPrice ?? null;
  const image = product.image ?? product.imageUrl ?? '/images/div.relative.png';
  const novaGrade = product.novaGrade ?? product.novaGroup ?? null;
  const statusText = product.statusText ?? '';
  const rating = product.rating ?? null;

  // 3. 대분류와 세부유형 각각 추출
  const mainCategory = getMainCategory(category);

  const inWishlist = isInWishlist(id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({ ...product, id, name, price });
    showToast(`${name}이(가) 장바구니에 추가되었습니다.`, 'success');
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist({ ...product, id, name });
    showToast(
      inWishlist
        ? `${name}이(가) 위시리스트에서 제거되었습니다.`
        : `${name}이(가) 위시리스트에 추가되었습니다.`,
      'success'
    );
  };

  return (
    <CardWrapper onClick={onClick}>
      <ImageWrapper>
        <img src={image} alt={name} />

        {/* NOVA 등급 / 대표 뱃지 */}
        {novaGrade ? (
          <Badge>
            NOVA {novaGrade} {statusText && `· ${statusText}`}
          </Badge>
        ) : product.badge ? (
          <Badge>{product.badge}</Badge>
        ) : null}

        {/* 위시리스트 & 장바구니 버튼 */}
        <WishlistButton onClick={handleToggleWishlist} $isWished={inWishlist}>
          {getIcon('heart')}
        </WishlistButton>
        <CartButton onClick={handleAddToCart}>
          {getIcon('shoppingBag')}
        </CartButton>
      </ImageWrapper>

      <CardInfo>
        <div>
          {/* 초록색 태그 칸 각각 독립적으로 분리 렌더링 */}
          <IngredientTags>
            {mainCategory && <IngredientTag>{mainCategory}</IngredientTag>}
            {category && <IngredientTag>{category}</IngredientTag>}
            {product.isUPF === false && <IngredientTag>#NOVA_CLEAN</IngredientTag>}
          </IngredientTags>

          <ProductName>{name}</ProductName>
          {brand && <ProductSub>{brand}</ProductSub>}
        </div>

        <PriceRow>
          <div>
            {originalPrice && (
              <OriginalPrice>{originalPrice.toLocaleString()}원</OriginalPrice>
            )}
            <CurrentPrice>{price.toLocaleString()}원</CurrentPrice>
          </div>
          {rating && <Rating>⭐ {rating}</Rating>}
        </PriceRow>
      </CardInfo>
    </CardWrapper>
  );
}

export default ProductCard;
