import styled from 'styled-components';
import { containerMax } from '../../../styles/mixins';

export const CategoriesSectionWrapper = styled.section`
  ${containerMax}
  padding: 2.5rem 1.5rem;
  width: 100%;
`;

export const SectionHeader = styled.div`
  margin-bottom: 2rem;

  h2 {
    font-size: 1.75rem;
    font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
    color: ${({ theme }) => theme.colors.textMain};
    margin-bottom: 0.5rem;
  }
`;

export const SectionLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  color: #10b981;
  background-color: #ecfdf5;
  padding: 4px 8px;
  border-radius: 6px;
  margin-bottom: 8px;
`;

export const CategoriesGrid = styled.div`
  display: grid;
  /* 10개에서 8개로 수정하여 전체 컨테이너 너비를 균등 분할하도록 변경 */
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 0.75rem; /* 카드 간 간격을 자연스럽게 조정 */
  width: 100%;
`;