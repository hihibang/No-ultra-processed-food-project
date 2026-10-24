import React from 'react';
import { useCart } from '../../hooks/useCart';
import { useCompare } from '../../hooks/useCompare';
import { useToast } from '../../hooks/useToast';
import { useWishlistToggle } from '../../hooks/useWishlistToggle';
import { getIcon } from '../../constants/icons';
import {
  CardWrapper,
  ImageWrapper,
  Badge,
  WishlistButton,
  CardInfo,
  IngredientTags,
  IngredientTag,
  ProductName,
  ProductSub,
  CompareButtonGroup,
  CompareButton,
} from './styles/ProductCard.styles';

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
  const { isInWishlist } = useCart();
  const { addToCompare, isInCompare } = useCompare();
  const { showToast } = useToast();
  const toggleWishlist = useWishlistToggle();

  if (!product) return null;

  const id = product.id ?? product.reportNo ?? '';
  const name = product.name ?? product.productName ?? '상품명 정보 없음';
  const brand = product.company ?? product.companyName ?? product.brand ?? '';
  const category = product.category ?? product.foodCategory ?? '';
  const price = product.price ?? 0;
  const originalPrice = product.originalPrice ?? null;
  const image = product.image ?? product.imageUrl ?? '/images/div.relative.png';
  const novaGrade = product.novaGrade ?? product.novaGroup ?? null;
  const statusText = product.statusText ?? '';
  const badgeColor = product.badgeColor ?? null;
  const rating = product.rating ?? null;

  const mainCategory = getMainCategory(category);
  const inWishlist = isInWishlist(id);

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist({ ...product, id, name });
  };

  const handleAddToCompare = (e) => {
    e.stopPropagation();
    addToCompare({ ...product, id, name, price });
  };

  const handleSimilarCompare = (e) => {
    e.stopPropagation();
    showToast(`${name}과 유사한 상품으로 비교합니다.`, 'info');
  };

  return (
    <CardWrapper onClick={onClick}>
      <ImageWrapper>
        <img src={image} alt={name} />

        {novaGrade ? (
          <Badge $badgeColor={badgeColor}$novaGrade={novaGrade}>
            NOVA {novaGrade} · {statusText}
          </Badge>
        ) : product.badge ? (
          <Badge>{product.badge}</Badge>
        ) : null}

        <WishlistButton onClick={handleToggleWishlist} $isWished={inWishlist}>
          {getIcon('heart')}
        </WishlistButton>
      </ImageWrapper>

      <CardInfo>
        <div>
          {/* #NOVA_CLEAN 제거 후 대분류 및 세부유형만 표시 */}
          <IngredientTags>
            {mainCategory && <IngredientTag>{mainCategory}</IngredientTag>}
            {category && <IngredientTag>{category}</IngredientTag>}
          </IngredientTags>

          <ProductName>{name}</ProductName>
          {brand && <ProductSub>{brand}</ProductSub>}
        </div>

        <div>

          <CompareButtonGroup>
            <CompareButton
              onClick={handleAddToCompare}
              $isActive={isInCompare(id)}
            >
              + 비교함 담기
            </CompareButton>
            <CompareButton
              onClick={handleSimilarCompare}
            >
              유사 상품 비교
            </CompareButton>
          </CompareButtonGroup>
        </div>
      </CardInfo>
    </CardWrapper>
  );
}

export default ProductCard;