import styled from 'styled-components';
import ProductCard from '../Common/ProductCard';
import { containerMax } from '../../styles/mixins';

const TimeDealSectionWrapper = styled.section`
  ${containerMax}
  padding: 2.5rem 1.5rem;
`;

const SectionHeader = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  div h2 {
    font-size: 1.75rem;
    font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
    color: ${({ theme }) => theme.colors.textMain};
    margin-bottom: 0.5rem;
  }

  div p {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.textSub};
  }
`;

const ViewAllButton = styled.button`
  background-color: ${({ theme }) => theme.colors.bgGray};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const SAMPLE_DEALS = [
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
    ingredients: ['무염', '#천연'],
    rating: 4.8,
  },
  {
    id: 6,
    name: '디톡스 스무디',
    brand: '웰니스',
    price: 16000,
    originalPrice: 20000,
    image: '/images/div.relative.png',
    badge: 'TRENDING',
    ingredients: ['저칼로리', '#유기농'],
    rating: 4.5,
  },
];

function TimeDealSection({ onViewAll }) {
  return (
    <TimeDealSectionWrapper>
      <SectionHeader>
        <div>
          <h2>⏰ 타임딜</h2>
          <p>시간 한정 특가 상품들</p>
        </div>
        <ViewAllButton onClick={onViewAll}>
          전체 보기 →
        </ViewAllButton>
      </SectionHeader>
      <ProductGrid>
        {SAMPLE_DEALS.map(deal => (
          <ProductCard key={deal.id} product={deal} />
        ))}
      </ProductGrid>
    </TimeDealSectionWrapper>
  );
}

export default TimeDealSection;
