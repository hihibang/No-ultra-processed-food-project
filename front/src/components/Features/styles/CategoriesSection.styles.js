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

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.textSub};
  }
`;

export const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 0.5rem;
  width: 100%;
`;
