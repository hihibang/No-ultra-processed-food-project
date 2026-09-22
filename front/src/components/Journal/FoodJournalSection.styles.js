import styled from 'styled-components';
import { containerMax } from '../../styles/mixins';

export const SectionContainer = styled.section`
  ${containerMax}
  width: 100%;
  padding: 40px 1.5rem 24px;
  box-sizing: border-box;
`;

export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  width: 100%;

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

export const ViewAllButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.15s ease;

  &:hover {
    color: #0f172a;
  }
`;

export const CardsGrid = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;