import { useState } from 'react';
import styled from 'styled-components';
import MainContainer from '../components/Layout/MainContainer';
import ProductCard from '../components/Common/ProductCard';
import { containerMax } from '../styles/mixins';
import { useToast } from '../hooks/useToast';

const CatalogWrapper = styled.div`
  ${containerMax}
  padding: 2rem 1.5rem;
`;

const CatalogHeader = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
    color: ${({ theme }) => theme.colors.textMain};
    margin-bottom: 0.5rem;
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.textSub};
  }
`;

const FiltersWrapper = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme, active }) => active ? theme.colors.primary : theme.colors.borderColor};
  background-color: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.white};
  color: ${({ theme, active }) => active ? theme.colors.white : theme.colors.textMain};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: '유기농 완전 밀가루',
    brand: '자연농업',
    price: 12000,
    originalPrice: 15000,
    image: '/images/div.relative.png',
    badge: 'HOT',
    ingredients: ['무첨가', '#글루텐프리'],
    rating: 4.8,
  },
  {
    id: 2,
    name: '저염 요거트',
    brand: '건강유제품',
    price: 8000,
    originalPrice: 10000,
    image: '/images/div.relative-1.png',
    badge: 'SALE',
    ingredients: ['저염', '#프로바이오틱스'],
    rating: 4.9,
  },
  {
    id: 3,
    name: '비건 단백질 쉐이크',
    brand: '식물식품',
    price: 18000,
    originalPrice: 22000,
    image: '/images/div.relative-2.png',
    ingredients: ['비건', '#단백질'],
    rating: 4.7,
  },
  {
    id: 4,
    name: '유기농 과일 잼',
    brand: '자연식품',
    price: 9000,
    originalPrice: 12000,
    image: '/images/div.relative-3.png',
    badge: 'NEW',
    ingredients: ['설탕무첨가', '#유기농'],
    rating: 4.6,
  },
  {
    id: 5,
    name: '견과류 버터',
    brand: '견과식품',
    price: 14000,
    originalPrice: 18000,
    image: '/images/div.relative.png',
    ingredients: ['무염', '#천연'],
    rating: 4.8,
  },
  {
    id: 6,
    name: '디톡스 스무디',
    brand: '웰니스',
    price: 16000,
    originalPrice: 20000,
    image: '/images/div.relative-1.png',
    badge: 'TRENDING',
    ingredients: ['저칼로리', '#유기농'],
    rating: 4.5,
  },
  {
    id: 7,
    name: '무첨가 시리얼',
    brand: '자연식품',
    price: 11000,
    originalPrice: 13000,
    image: '/images/div.relative-2.png',
    ingredients: ['무설탕', '#식이섬유'],
    rating: 4.7,
  },
  {
    id: 8,
    name: '프로바이오틱 요구르트',
    brand: '건강유제품',
    price: 7000,
    originalPrice: 9000,
    image: '/images/div.relative-3.png',
    badge: 'SALE',
    ingredients: ['프로바이오틱', '#저지방'],
    rating: 4.8,
  },
];

const FILTER_OPTIONS = ['전체', '저당', '비건', '유기농', '글루텐프리', '무첨가'];

function CatalogPage() {
  const [activeFilter, setActiveFilter] = useState('전체');
  const { showToast } = useToast();

  const handleSearch = (searchQuery) => {
    showToast(`'${searchQuery}'에 대한 검색 결과입니다.`, 'success', 2000);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    showToast(`${filter} 필터가 적용되었습니다.`, 'success', 1500);
  };

  return (
    <MainContainer onSearch={handleSearch}>
      <CatalogWrapper>
        <CatalogHeader>
          <h1>📦 전체 상품 카탈로그</h1>
          <p>당신의 건강을 위한 모든 식품들</p>
        </CatalogHeader>

        <FiltersWrapper>
          {FILTER_OPTIONS.map(filter => (
            <FilterButton
              key={filter}
              active={activeFilter === filter}
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
            </FilterButton>
          ))}
        </FiltersWrapper>

        <ProductGrid>
          {SAMPLE_PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      </CatalogWrapper>
    </MainContainer>
  );
}

export default CatalogPage;
