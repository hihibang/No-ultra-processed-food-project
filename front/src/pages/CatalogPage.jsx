import { useState, useMemo } from 'react';
import MainContainer from '../components/Layout/MainContainer';
import ProductCard from '../components/Common/ProductCard';
import FilterSidebar from '../components/Common/FilterSidebar';
import { useToast } from '../hooks/useToast';
import { CATEGORY_OPTIONS, SAMPLE_PRODUCTS } from '../data/CatalogPage.data';
import {
  NOVA_GRADES,
  NUTRITION_FILTERS,
  EXCLUDED_ADDITIVES,
} from '../data/FilterSidebar.data';
import {
  CatalogWrapper,
  CatalogHeader,
  CatalogLayout,
  MainContent,
  CatalogActionBar,
  ActiveChipsWrapper,
  FilterChip,
  ChipColorDot,
  ClearAllButton,
  SortAndCountWrapper,
  ProductCount,
  SortSelectWrapper,
  ProductGrid,
} from './styles/CatalogPage.styles';

function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [filterState, setFilterState] = useState({
    novaGrades: [],
    nutritionFilters: [],
    excludedAdditives: [],
  });
  const [sortOption, setSortOption] = useState('popular');
  const { showToast } = useToast();

  const handleSearch = (searchQuery) => {
    showToast(`'${searchQuery}'에 대한 검색 결과입니다.`, 'success', 2000);
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    showToast(`'${category}' 카테고리를 선택했습니다.`, 'success', 1500);
  };

  const handleFilterChange = (updatedFilters) => {
    setFilterState(updatedFilters);
  };

  // 선택된 필터들을 상단 칩 배열로 변환
  const activeChips = useMemo(() => {
    const chips = [];

    // 1. 카테고리: '전체'를 포함하여 현재 선택된 카테고리를 항상 첫 번째 칩으로 유지
    if (activeCategory) {
      chips.push({
        type: 'category',
        id: activeCategory,
        label: activeCategory,
      });
    }

    // 2. NOVA 가공 등급
    filterState.novaGrades.forEach((gradeId) => {
      const item = NOVA_GRADES.find((g) => g.id === gradeId);
      if (item) {
        chips.push({
          type: 'nova',
          id: gradeId,
          label: `NOVA ${item.id}`,
          color: item.color,
        });
      }
    });

    // 3. 영양성분 필터
    filterState.nutritionFilters.forEach((nutId) => {
      const item = NUTRITION_FILTERS.find((n) => n.id === nutId);
      if (item) {
        chips.push({
          type: 'nutrition',
          id: nutId,
          label: item.label,
        });
      }
    });

    // 4. 제외 첨가물 필터
    filterState.excludedAdditives.forEach((addId) => {
      const item = EXCLUDED_ADDITIVES.find((a) => a.id === addId);
      if (item) {
        chips.push({
          type: 'additive',
          id: addId,
          label: item.label,
        });
      }
    });

    return chips;
  }, [activeCategory, filterState]);

  // 상단 칩 개별 삭제 (✕ 클릭)
  const handleRemoveChip = (chip) => {
    if (chip.type === 'category') {
      setActiveCategory('전체');
    } else if (chip.type === 'nova') {
      setFilterState((prev) => ({
        ...prev,
        novaGrades: prev.novaGrades.filter((id) => id !== chip.id),
      }));
    } else if (chip.type === 'nutrition') {
      setFilterState((prev) => ({
        ...prev,
        nutritionFilters: prev.nutritionFilters.filter((id) => id !== chip.id),
      }));
    } else if (chip.type === 'additive') {
      setFilterState((prev) => ({
        ...prev,
        excludedAdditives: prev.excludedAdditives.filter((id) => id !== chip.id),
      }));
    }
  };

  // '초기화 ↺' 클릭 시 모든 필터 및 카테고리 완전 리셋
  const handleResetAll = () => {
    setActiveCategory('전체');
    setFilterState({
      novaGrades: [],
      nutritionFilters: [],
      excludedAdditives: [],
    });
  };

  // 세부 조건(NOVA, 영양성분, 첨가물)이 하나라도 선택되었는지 확인
  const hasDetailFilters =
    filterState.novaGrades.length > 0 ||
    filterState.nutritionFilters.length > 0 ||
    filterState.excludedAdditives.length > 0;

  return (
    <MainContainer onSearch={handleSearch}>
      <CatalogWrapper>
        <CatalogHeader>
          <h1>전체 상품 카탈로그</h1>
          <p>당신의 건강을 위한 모든 식품들</p>
        </CatalogHeader>

        <CatalogLayout>
          {/* 좌측 필터 사이드바 */}
          <FilterSidebar
            categories={CATEGORY_OPTIONS}
            activeCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
            filterState={filterState}
            onFilterChange={handleFilterChange}
          />

          {/* 우측 상품 목록 & 상단 동적 필터 칩 영역 */}
          <MainContent>
            <CatalogActionBar>
              <ActiveChipsWrapper>
                {/* 카테고리가 '전체'이고 세부 필터도 없을 때는 ✕ 없는 단독 [전체] 버튼 */}
                {activeCategory === '전체' && !hasDetailFilters ? (
                  <FilterChip $active={true}>
                    전체
                  </FilterChip>
                ) : (
                  /* 세부 필터가 있거나 특정 카테고리가 선택되면 '전체' 칩을 포함하여 나란히 표시 */
                  <>
                    {activeChips.map((chip) => (
                      <FilterChip
                        key={`${chip.type}-${chip.id}`}
                        $active={true}
                        onClick={() => handleRemoveChip(chip)}
                      >
                        {chip.color && <ChipColorDot $color={chip.color} />}
                        <span>{chip.label}</span>
                        <span className="remove-icon">✕</span>
                      </FilterChip>
                    ))}

                    <ClearAllButton onClick={handleResetAll}>초기화 ↺</ClearAllButton>
                  </>
                )}
              </ActiveChipsWrapper>

              <SortAndCountWrapper>
                <ProductCount>
                  전체 <strong>{SAMPLE_PRODUCTS.length}</strong>개 식품
                </ProductCount>
                <SortSelectWrapper>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="popular">인기도순</option>
                    <option value="latest">최신순</option>
                    <option value="lowPrice">낮은 가격순</option>
                    <option value="highPrice">높은 가격순</option>
                  </select>
                </SortSelectWrapper>
              </SortAndCountWrapper>
            </CatalogActionBar>

            {/* 6열 그리드 상품 목록 */}
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