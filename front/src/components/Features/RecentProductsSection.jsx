import { useEffect, useState } from 'react';
import ProductCard from '../Common/ProductCard';
import { foodApi } from '../../api/foodApi';
import { toCatalogCardProduct } from '../../utils/product';
import {
  RecentWrapper,
  SectionHeader,
  SectionLabel,
  ProductGrid,
  Message,
} from './styles/RecentProductsSection.styles';

const RECENT_LIMIT = 5;

function RecentProductsSection() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    foodApi.recent(RECENT_LIMIT)
      .then((result) => {
        if (cancelled) return;
        setProducts(result.data ?? []);
        setStatus('ready');
      })
      .catch((error) => {
        // 메인 진입을 막지 않도록 실패 시 섹션만 숨기고 토스트는 띄우지 않음
        console.error('최신 상품 조회 실패:', error);
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'error') return null;

  return (
    <RecentWrapper>
      <SectionHeader>
        <div>
          <SectionLabel>🆕 방금 등록된 식품</SectionLabel>
          <h2>📌 최신 등록 상품 (TOP 5)</h2>
        </div>
      </SectionHeader>

      {status === 'loading' && <Message>최신 상품을 불러오는 중입니다...</Message>}
      {status === 'ready' && products.length === 0 && (
        <Message>등록된 상품이 없습니다.</Message>
      )}
      {status === 'ready' && products.length > 0 && (
        <ProductGrid>
          {products.map((item) => (
            <ProductCard key={item.reportNo} product={toCatalogCardProduct(item)} />
          ))}
        </ProductGrid>
      )}
    </RecentWrapper>
  );
}

export default RecentProductsSection;
