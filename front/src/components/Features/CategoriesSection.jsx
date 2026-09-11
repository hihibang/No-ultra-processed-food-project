import styled from 'styled-components';
import CategoryCard from '../Common/CategoryCard';
import { containerMax } from '../../styles/mixins';

const CategoriesSectionWrapper = styled.section`
  ${containerMax}
  padding: 2.5rem 1.5rem;
`;

const SectionHeader = styled.div`
  margin-bottom: 2rem;

  h2 {
    font-size: 1.75rem;
    font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
    color: ${({ theme }) => theme.colors.textMain};
    margin-bottom: 0.5rem;
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.textSub};
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.25rem;
`;

const CATEGORIES = [
  { id: 1, icon: '🛒', title: '전체', subtitle: '모든 상품' },
  { id: 2, icon: '🥐', title: '베이커리', subtitle: '신선한 빵' },
  { id: 3, icon: '☕', title: '음료/티', subtitle: '음료 모음' },
  { id: 4, icon: '🍰', title: '디저트', subtitle: '달콤한' },
  { id: 5, icon: '🥕', title: '신선식품', subtitle: '제철 음식' },
  { id: 6, icon: '🍲', title: '간편식', subtitle: '편한 식사' },
  { id: 7, icon: '🌱', title: '유기농', subtitle: '자연 식품' },
  { id: 8, icon: '🥫', title: '소스/양념', subtitle: '양념류' },
  { id: 9, icon: '🥜', title: '견과/스낵', subtitle: '간식' },
  { id: 10, icon: '💊', title: '건강식품', subtitle: '웰니스' },
];

function CategoriesSection({ onCategoryClick }) {
  const handleCategoryClick = (category) => {
    onCategoryClick?.(category);
  };

  return (
    <CategoriesSectionWrapper>
      <SectionHeader>
        <h2>🏪 카테고리 쇼핑</h2>
        <p>원하는 카테고리를 선택하세요</p>
      </SectionHeader>
      <CategoriesGrid>
        {CATEGORIES.map(category => (
          <CategoryCard
            key={category.id}
            icon={category.icon}
            title={category.title}
            subtitle={category.subtitle}
            onClick={() => handleCategoryClick(category)}
          />
        ))}
      </CategoriesGrid>
    </CategoriesSectionWrapper>
  );
}

export default CategoriesSection;
