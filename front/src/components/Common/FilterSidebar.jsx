import { useState, useRef, useEffect } from 'react';
import {
  FilterSidebarWrapper,
  SectionContent,
  MasterCategoryHeader,
  SectionTitle,
  CategoryList,
  CategoryButton,
  MasterFilterModal,
  ModalHeader,
  ModalGridContent,
  ModalSectionTitle,
  FilterGroupWrapper,
  CheckboxGroup,
  CheckboxLabel,
  ColorDot,
  ModalFooter,
  ResetButton,
  ApplyButton,
  NovaTitleWrapper,
  InfoIconButton,
  NovaInfoPopover,
  GradeItem,
} from './styles/FilterSidebar.styles';
import {
  NOVA_INFO,
  NOVA_GRADES,
  NUTRITION_FILTERS,
  EXCLUDED_ADDITIVES,
} from '../../data/FilterSidebar.data';

function FilterSidebar({
  categories,
  activeCategory,
  onCategorySelect,
  filterState = { novaGrades: [], nutritionFilters: [], excludedAdditives: [] },
  onFilterChange,
}) {
  const { novaGrades = [], nutritionFilters = [], excludedAdditives = [] } = filterState;
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const [showNovaPopover, setShowNovaPopover] = useState(false);
  const sidebarRef = useRef(null);
  const novaPopoverRef = useRef(null);

  // 모바일 탭 및 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (novaPopoverRef.current && !novaPopoverRef.current.contains(event.target)) {
        setShowNovaPopover(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMasterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 데스크톱: 아이콘/팝오버 영역 진입 시 노출
  const handleMouseEnter = () => {
    if (window.matchMedia('(hover: hover)').matches) {
      setShowNovaPopover(true);
    }
  };

  // 데스크톱: 아이콘/팝오버 영역 이탈 시 숨김
  const handleMouseLeave = () => {
    if (window.matchMedia('(hover: hover)').matches) {
      setShowNovaPopover(false);
    }
  };

  // 모바일 터치 및 클릭 토글
  const handleIconClick = (e) => {
    e.stopPropagation();
    setShowNovaPopover((prev) => !prev);
  };

  const handleNovaChange = (gradeId) => {
    const updatedGrades = novaGrades.includes(gradeId)
      ? novaGrades.filter((id) => id !== gradeId)
      : [...novaGrades, gradeId];
    if (onFilterChange) {
      onFilterChange({ ...filterState, novaGrades: updatedGrades });
    }
  };

  const handleNutritionChange = (filterId) => {
    const updatedNutrition = nutritionFilters.includes(filterId)
      ? nutritionFilters.filter((id) => id !== filterId)
      : [...nutritionFilters, filterId];
    if (onFilterChange) {
      onFilterChange({ ...filterState, nutritionFilters: updatedNutrition });
    }
  };

  const handleAdditiveChange = (additiveId) => {
    const updatedAdditives = excludedAdditives.includes(additiveId)
      ? excludedAdditives.filter((id) => id !== additiveId)
      : [...excludedAdditives, additiveId];
    if (onFilterChange) {
      onFilterChange({ ...filterState, excludedAdditives: updatedAdditives });
    }
  };

  const handleResetFilters = () => {
    if (onFilterChange) {
      onFilterChange({ novaGrades: [], nutritionFilters: [], excludedAdditives: [] });
    }
  };

  return (
    <FilterSidebarWrapper ref={sidebarRef}>
      <SectionContent>
        {/* 마스터 카테고리 헤더 */}
        <MasterCategoryHeader onClick={() => setIsMasterOpen(!isMasterOpen)}>
          <div className="title-group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
            <SectionTitle>카테고리</SectionTitle>
          </div>
          <span className="filter-icon">필터 열기 ⚙</span>
        </MasterCategoryHeader>

        {/* 좌측 기본 카테고리 목록 */}
        <CategoryList>
          {categories &&
            categories.map((cat) => (
              <CategoryButton
                key={cat}
                $active={activeCategory === cat}
                onClick={() => onCategorySelect(cat)}
              >
                {cat}
              </CategoryButton>
            ))}
        </CategoryList>
      </SectionContent>

      {/* 전체 통합 필터 팝업 모달 */}
      {isMasterOpen && (
        <MasterFilterModal onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <h4>통합 식품 필터 탐색기</h4>
            <button className="close-btn" onClick={() => setIsMasterOpen(false)}>✕</button>
          </ModalHeader>

          <ModalGridContent>
            {/* 1열: 카테고리 */}
            <div>
              <ModalSectionTitle>식품 카테고리</ModalSectionTitle>
              <CategoryList>
                {categories &&
                  categories.map((cat) => (
                    <CategoryButton
                      key={cat}
                      $active={activeCategory === cat}
                      onClick={() => onCategorySelect(cat)}
                    >
                      {cat}
                    </CategoryButton>
                  ))}
              </CategoryList>
            </div>

            {/* 2열: NOVA 등급 + 영양성분 + 첨가물 */}
            <FilterGroupWrapper>
              {/* NOVA 가공 등급 타이틀 + 축소된 호버 영역 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
                  <ModalSectionTitle style={{ marginBottom: 0 }}>
                    NOVA 가공 등급 (UPF)
                  </ModalSectionTitle>

                  {/* 호버 영역을 아이콘과 팝오버 상자에만 타이트하게 제한 */}
                  <NovaTitleWrapper
                    ref={novaPopoverRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <InfoIconButton
                      type="button"
                      onClick={handleIconClick}
                      title="NOVA 가공 등급 체계 알아보기"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                        <path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3" />
                        <path d="M12 17h.01" />
                      </svg>
                    </InfoIconButton>

                    {/* 호버/터치 시 노출되는 NOVA 안내 팝오버 */}
                    {showNovaPopover && (
                      <NovaInfoPopover onClick={(e) => e.stopPropagation()}>
                        <h5>{NOVA_INFO.title}</h5>
                        <p className="intro-text">{NOVA_INFO.description}</p>
                        {NOVA_INFO.grades.map((grade, idx) => (
                          <GradeItem key={idx}>
                            <div className="grade-header">
                              <ColorDot $color={grade.color} />
                              <span>{grade.level}</span>
                            </div>
                            <p className="grade-desc">{grade.description}</p>
                            <p className="grade-examples">예: {grade.examples}</p>
                          </GradeItem>
                        ))}
                      </NovaInfoPopover>
                    )}
                  </NovaTitleWrapper>
                </div>

                <CheckboxGroup>
                  {NOVA_GRADES.map((grade) => (
                    <CheckboxLabel key={grade.id}>
                      <input
                        type="checkbox"
                        checked={novaGrades.includes(grade.id)}
                        onChange={() => handleNovaChange(grade.id)}
                      />
                      <ColorDot $color={grade.color} />
                      <span>{grade.label}</span>
                    </CheckboxLabel>
                  ))}
                </CheckboxGroup>
              </div>

              {/* 영양성분 필터 */}
              <div>
                <ModalSectionTitle>영양성분 필터</ModalSectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {NUTRITION_FILTERS.map((filter) => (
                    <CheckboxLabel key={filter.id}>
                      <input
                        type="checkbox"
                        checked={nutritionFilters.includes(filter.id)}
                        onChange={() => handleNutritionChange(filter.id)}
                      />
                      <span>{filter.label}</span>
                    </CheckboxLabel>
                  ))}
                </div>
              </div>

              {/* 제외할 첨가물 */}
              <div>
                <ModalSectionTitle>제외할 첨가물</ModalSectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {EXCLUDED_ADDITIVES.map((additive) => (
                    <CheckboxLabel key={additive.id}>
                      <input
                        type="checkbox"
                        checked={excludedAdditives.includes(additive.id)}
                        onChange={() => handleAdditiveChange(additive.id)}
                      />
                      <span>{additive.label}</span>
                    </CheckboxLabel>
                  ))}
                </div>
              </div>
            </FilterGroupWrapper>
          </ModalGridContent>

          <ModalFooter>
            <ResetButton onClick={handleResetFilters}>필터 초기화 ↺</ResetButton>
            <ApplyButton onClick={() => setIsMasterOpen(false)}>선택 완료</ApplyButton>
          </ModalFooter>
        </MasterFilterModal>
      )}
    </FilterSidebarWrapper>
  );
}

export default FilterSidebar;