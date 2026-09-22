import CategoryCard from '../Common/CategoryCard';
import { getIcon } from '../../constants/icons';
import { CATEGORIES } from '../../data/CategoriesSection.data';
import {
  CategoriesSectionWrapper,
  SectionHeader,
  SectionLabel,
  CategoriesGrid,
} from './styles/CategoriesSection.styles';

function CategoriesSection({ onCategoryClick }) {
  const handleCategoryClick = (category) => {
    onCategoryClick?.(category);
  };

  return (
    <CategoriesSectionWrapper>
      <SectionHeader>
        <SectionLabel>🛒 취향 맞춤 탐색</SectionLabel>
        <h2>🏪 카테고리 쇼핑</h2>
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