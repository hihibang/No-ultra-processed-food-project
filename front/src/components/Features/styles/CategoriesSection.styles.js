import styled from 'styled-components';
import { containerMax } from '../../../styles/mixins';

export const CategoriesSectionWrapper = styled.section`
  ${containerMax}
  padding: 2.5rem 1.5rem;
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
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 0.5rem;
  width: 100%;
`;