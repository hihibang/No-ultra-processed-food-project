import styled from 'styled-components';
import { Card } from '../../components/Recommendation/styles/Recommendation.styles';

export const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textMain};
`;

export const PageSubtitle = styled.p`
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.textSub};
  font-size: 0.95rem;
`;

export const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

export const Pill = styled.button`
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.borderColor)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.white)};
  color: ${({ theme, $active }) => ($active ? theme.colors.white : theme.colors.textMain)};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
`;

export const SelectableCard = styled(Card)`
  cursor: pointer;
  border: 2px solid ${({ theme, $active }) => ($active ? theme.colors.primary : 'transparent')};
`;
