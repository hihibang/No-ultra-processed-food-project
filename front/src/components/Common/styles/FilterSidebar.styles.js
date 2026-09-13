import styled from 'styled-components';

export const FilterSidebarWrapper = styled.aside`
  width: 230px;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors?.white || '#ffffff'};
  border: 1px solid ${({ theme }) => theme.colors?.borderColor || '#e2e8f0'};
  border-radius: ${({ theme }) => theme.borderRadius?.md || '0.75rem'};
  padding: 1rem 0.75rem 1.25rem;
  position: relative;
  
  /* 상품 카드(보통 z-index 1~5)보다는 높이고, 로그인 모달(9999)보다는 낮게 설정 */
  z-index: 20; 
`;
export const MasterFilterModal = styled.div`
  position: absolute;
  top: 0;
  left: calc(100% + 14px);
  width: 620px;
  background-color: #ffffff; /* 순백색 불투명 배경 */
  border: 1px solid ${({ theme }) => theme.colors?.borderColor || '#e2e8f0'};
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.2), 0 0 1px 1px rgba(0, 0, 0, 0.05);
  
  /* 상품 카드의 HOT/SALE 배지 및 버튼보다 무조건 위에 오도록 설정 */
  z-index: 500;
  cursor: default;

  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: -7px;
    width: 12px;
    height: 12px;
    background-color: #ffffff;
    border-left: 1px solid ${({ theme }) => theme.colors?.borderColor || '#e2e8f0'};
    border-bottom: 1px solid ${({ theme }) => theme.colors?.borderColor || '#e2e8f0'};
    transform: rotate(45deg);
    z-index: 501;
  }
`;

export const SectionContent = styled.div`
  margin-bottom: 0.5rem;
`;

export const NovaTitleWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  position: relative;
  margin-bottom: 0.6rem;
  width: fit-content;        /* 우측 빈 공간으로 영역이 확장되는 현상 원천 차단 */
  max-width: 100%;
`;

export const NovaInfoPopover = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;           /* 8px -> 4px로 줄여 아이콘과 상자 사이 틈새 축소 */
  width: 300px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 0 1px 1px rgba(0, 0, 0, 0.05);
  z-index: 1100;
  cursor: default;

  /* 꼬리표 삼각형 위치 살짝 조정 */
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 20px;
    width: 8px;
    height: 8px;
    background-color: #ffffff;
    border-left: 1px solid #e2e8f0;
    border-top: 1px solid #e2e8f0;
    transform: rotate(45deg);
  }

  h5 {
    margin: 0 0 6px 0;
    font-size: 0.92rem;
    font-weight: 700;
    color: #0f172a;
  }

  .intro-text {
    font-size: 0.78rem;
    color: #475569;
    margin: 0 0 10px 0;
    line-height: 1.4;
    white-space: pre-line;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textMain || '#0f172a'};
  margin: 0;
`;

export const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const CategoryButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.55rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background-color: ${({ theme, $active }) =>
    $active ? '#ecfdf5' : 'transparent'};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary || '#059669' : theme.colors.textMain || '#0f172a'};
  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme, $active }) =>
    $active ? '#ecfdf5' : theme.colors.bgGray || '#f3f4f6'};
    color: ${({ theme }) => theme.colors.primary || '#059669'};
  }
`;


export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;

  h4 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.textMain || '#0f172a'};
  }

  .close-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: #94a3b8;
    &:hover { color: #0f172a; }
  }
`;

/* 좌우 2단 분할 레이아웃 (왼쪽: 카테고리 / 오른쪽: NOVA, 영양, 첨가물) */
export const ModalGridContent = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 1.5rem;
`;

export const ModalSectionTitle = styled.div`
  font-size: 0.82rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSub || '#64748b'};
  margin-bottom: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

export const FilterGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.4rem;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textMain || '#0f172a'};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f8fafc;
  }

  input[type='checkbox'] {
    width: 15px;
    height: 15px;
    cursor: pointer;
    flex-shrink: 0;
    accent-color: ${({ theme }) => theme.colors.primary || '#059669'};
  }

  > span {
    flex: 1;
    white-space: nowrap;
  }
`;

export const ColorDot = styled.span`
  width: 8px !important;
  height: 8px !important;
  min-width: 8px !important;
  max-width: 8px !important;
  min-height: 8px !important;
  max-height: 8px !important;
  border-radius: 50% !important;
  background-color: ${({ $color }) => $color};
  flex: none !important;
  flex-shrink: 0 !important;
  display: inline-block;
  margin-right: 2px;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
`;

export const ResetButton = styled.button`
  padding: 0.55rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.borderColor || '#e2e8f0'};
  background-color: #ffffff;
  color: #64748b;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;

  &:hover {
    background-color: #f8fafc;
    color: #0f172a;
  }
`;

export const ApplyButton = styled.button`
  padding: 0.55rem 1.4rem;
  background-color: ${({ theme }) => theme.colors.primary || '#059669'};
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

/* 기존 스타일 파일 하단에 추가 또는 수정 */

export const InfoIconButton = styled.button`
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  border-radius: 50%;
  transition: all 0.15s ease;

  &:hover {
    color: #059669;
    background-color: #ecfdf5;
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

export const GradeItem = styled.div`
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  .grade-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 2px;
  }

  .grade-desc {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0;
    padding-left: 14px;
    line-height: 1.3;
  }

  .grade-examples {
    font-size: 0.72rem;
    color: #94a3b8;
    margin: 2px 0 0;
    padding-left: 14px;
  }
`;

export const MasterCategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.2rem 0.8rem;
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor || '#e2e8f0'};
  margin-bottom: 0.75rem;

  .title-group {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .filter-icon {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.primary || '#059669'};
    background: #ecfdf5;
    padding: 3px 6px;
    border-radius: 6px;
    font-weight: 700;
    white-space: nowrap; /* 줄바꿈 방지 */
    display: flex;
    align-items: center;
    gap: 2px;
  }

  &:hover .filter-icon {
    background: ${({ theme }) => theme.colors.primary || '#059669'};
    color: #ffffff;
  }
`;