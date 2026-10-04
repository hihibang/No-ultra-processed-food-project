import { useState, useEffect, useMemo } from 'react';
import MainContainer from '../components/Layout/MainContainer';
import ProductCard from '../components/Common/ProductCard';
import FilterSidebar from '../components/Common/FilterSidebar';
import { useToast } from '../hooks/useToast';
import { CATEGORY_OPTIONS } from '../data/CatalogPage.data';
import {
  NOVA_GRADES,
  NUTRITION_FILTERS,
  EXCLUDED_ADDITIVES,
} from '../data/FilterSidebar.data';
import {
  CatalogWrapper,
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('전체');
  const [filterState, setFilterState] = useState({
    novaGrades: [],
    nutritionFilters: [],
    excludedAdditives: [],
  });
  const [sortOption, setSortOption] = useState('popular');
  const { showToast } = useToast();

  // 1. 백엔드 API에서 식품 목록 불러오기 (Swagger GET /api/foods/search?q= 연동)
  const fetchFoods = async (query = '') => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/foods/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const result = await response.json();
      // API 응답 객체 구조: { count: number, data: [...] }
      setProducts(result.data || []);
    } catch (error) {
      console.error('API Fetch Error:', error);
      showToast('식품 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 마운트 시 초기 전체 데이터 연동
  useEffect(() => {
    fetchFoods('');
  }, []);

  // 검색어 입력 핸들러
  const handleSearch = (searchQuery) => {
    fetchFoods(searchQuery);
    showToast(`'${searchQuery}' 검색 결과입니다.`, 'success', 2000);
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

    if (activeCategory) {
      chips.push({
        type: 'category',
        id: activeCategory,
        label: activeCategory,
      });
    }

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

  // 상단 칩 개별 삭제
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

  // 초기화 ↺
  const handleResetAll = () => {
    setActiveCategory('전체');
    setFilterState({
      novaGrades: [],
      nutritionFilters: [],
      excludedAdditives: [],
    });
  };

  const hasDetailFilters =
    filterState.novaGrades.length > 0 ||
    filterState.nutritionFilters.length > 0 ||
    filterState.excludedAdditives.length > 0;

  return (
    <MainContainer onSearch={handleSearch}>
      <CatalogWrapper>
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
                {activeCategory === '전체' && !hasDetailFilters ? (
                  <FilterChip $active={true}>전체</FilterChip>
                ) : (
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
                  전체 <strong>{products.length}</strong>개 식품
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

            {/* 6열 그리드 상품 목록 (DB 연동 및 Data Mapping) */}
            <ProductGrid>
              {loading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
                  식품 데이터를 불러오는 중입니다...
                </div>
              ) : products.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
                  조건에 맞는 식품이 없습니다.
                </div>
              ) : (
                products.map((item) => (
                  <ProductCard
                    key={item.reportNo}
                    product={{
                      id: item.reportNo,
                      name: item.productName,
                      company: item.companyName,
                      category: item.foodCategory,
                      calories: item.calories,
                      novaGrade: item.novaGroup,
                      statusText: item.statusText,
                      badgeColor: item.badgeColor,
                      isUPF: item.isUPF,
                    }}
                  />
                ))
              )}
            </ProductGrid>
          </MainContent>
        </CatalogLayout>
      </CatalogWrapper>
    </MainContainer>
  );
}

export default CatalogPage;