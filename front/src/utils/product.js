// 상품 식별자: 카탈로그 응답은 reportNo, 내부 상품 객체는 id를 사용
export const getProductId = (product) => String(product?.id ?? product?.reportNo ?? '');

// 찜/비교함에 저장할 때 화면 공통 필드(id, name, image 등)를 맞춘다
export const normalizeProduct = (product) => {
  const id = getProductId(product);
  return {
    ...product,
    id,
    reportNo: id,
    name: product.name ?? product.productName ?? '',
    productName: product.productName ?? product.name ?? '',
    companyName: product.companyName ?? product.company ?? '',
    imageUrl: product.imageUrl ?? product.image ?? null,
  };
};

// 식품 검색/최신 상품 응답(camelCase)을 ProductCard 입력 형태로 변환
export const toCatalogCardProduct = (item) => ({
  id: item.reportNo,
  name: item.productName,
  company: item.companyName,
  category: item.foodCategory,
  calories: item.calories,
  imageUrl: item.imageUrl,
  novaGrade: item.novaGroup,
  statusText: item.statusText,
  badgeColor: item.badgeColor,
  isUPF: item.isUPF,
});

// 서버 찜 목록 응답({ food_id, food_details })을 화면 상품 객체로 변환
export const fromWishlistEntry = (entry) => {
  const details = entry.food_details;
  return normalizeProduct({
    reportNo: entry.food_id,
    productName: details?.productName ?? '삭제된 상품',
    companyName: details?.companyName ?? '',
    foodCategory: details?.foodCategory ?? '',
    calories: details?.calories ?? 0,
    imageUrl: details?.imageUrl ?? null,
  });
};
