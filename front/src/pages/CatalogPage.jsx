import { useState } from 'react';
import MainContainer from '../components/Layout/MainContainer';
import ProductCard from '../components/Common/ProductCard';
import { useToast } from '../hooks/useToast';
import { CATEGORY_OPTIONS, FILTER_OPTIONS, SAMPLE_PRODUCTS } from '../data/CatalogPage.data';
import {
  CatalogWrapper,
  CatalogHeader,
  CatalogLayout,
  CategorySidebar,
  CategoryList,
  CategoryItem,
  MainContent,
  FiltersWrapper,
  FilterButton,
  ProductGrid,
} from './styles/CatalogPage.styles';

function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [activeFilter, setActiveFilter] = useState('전체');
  const { showToast } = useToast();

  const handleSearch = (searchQuery) => {
    showToast(`'${searchQuery}'에 대한 검색 결과입니다.`, 'success', 2000);
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    showToast(`'${category}' 카테고리를 선택했습니다.`, 'success', 1500);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    showToast(`${filter} 필터가 적용되었습니다.`, 'success', 1500);
  };

  return (
    <MainContainer onSearch={handleSearch}>
      <CatalogWrapper>
        <CatalogHeader>
          <h1>전체 상품 카탈로그</h1>
          <p>당신의 건강을 위한 모든 식품들</p>
        </CatalogHeader>

        <CatalogLayout>
          {/* 좌측 카테고리 메뉴 */}
          <CategorySidebar>
            <h3>카테고리</h3>
            <CategoryList>
              {CATEGORY_OPTIONS.map((cat) => (
                <li key={cat}>
                  <CategoryItem
                    $active={activeCategory === cat}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    {cat}
                  </CategoryItem>
                </li>
              ))}
            </CategoryList>
          </CategorySidebar>

          {/* 우측 성분 필터 태그 + 상품 목록 */}
          <MainContent>
            <FiltersWrapper>
              {FILTER_OPTIONS.map((filter) => (
                <FilterButton
                  key={filter}
                  $active={activeFilter === filter}
                  onClick={() => handleFilterClick(filter)}
                >
                  {filter}
                </FilterButton>
              ))}
            </FiltersWrapper>

            <ProductGrid>
              {SAMPLE_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          </MainContent>
        </CatalogLayout>
      </CatalogWrapper>
    </MainContainer>
  );
}

export default CatalogPage;