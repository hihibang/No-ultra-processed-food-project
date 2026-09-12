import CategoryCard from '../Common/CategoryCard';
import { getIcon } from '../../constants/icons';
import { CATEGORIES } from '../../data/CategoriesSection.data';
import {
  CategoriesSectionWrapper,
  SectionHeader,
  CategoriesGrid,
} from './styles/CategoriesSection.styles';

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
            icon={getIcon(category.iconKey)}
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
