import styled from 'styled-components';
import { containerMax } from '../../../styles/mixins';

export const RecentWrapper = styled.section`
  ${containerMax}
  padding: 2.5rem 1.5rem;
`;

export const SectionHeader = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  div h2 {
    font-size: 1.75rem;
    font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
    color: ${({ theme }) => theme.colors.textMain};
    margin-bottom: 0.5rem;
  }
`;

/* 푸드 저널과 동일한 초록색 라벨 배지 */
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

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(220px, 1fr));
  gap: 1.5rem;
`;

export const Message = styled.p`
  padding: 40px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSub};
`;
