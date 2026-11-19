import styled from 'styled-components';

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.bgGray};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 12px;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMain};
`;

export const SectionDesc = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSub};
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 10px;
`;

export const CardImage = styled.img`
  width: 100%;
  height: 110px;
  object-fit: contain;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
`;

export const CardName = styled.strong`
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textMain};
  line-height: 1.35;
`;

export const CardSub = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSub};
`;

export const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${({ $tone, theme }) => ($tone === 'warn' ? '#fff7ed' : `${theme.colors.primary}14`)};
  color: ${({ $tone, theme }) => ($tone === 'warn' ? theme.colors.warning : theme.colors.primary)};
`;

export const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

export const SmallButton = styled.button`
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: ${({ $solid, theme }) => ($solid ? theme.colors.primary : theme.colors.white)};
  color: ${({ $solid, theme }) => ($solid ? theme.colors.white : theme.colors.primary)};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const TabRow = styled.div`
  display: flex;
  gap: 0.4rem;
`;

export const Tab = styled.button`
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.borderColor)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.white)};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.textSub)};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
`;

export const MutedText = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const GaugeTrack = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.borderColor};
  overflow: hidden;
`;

export const GaugeFill = styled.div`
  height: 100%;
  width: ${({ $percent }) => Math.max(0, Math.min(100, $percent))}%;
  background: ${({ theme }) => theme.colors.primary};
  transition: width 0.3s ease;
`;

export const HeadlineBadge = styled.div`
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary}14;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.88rem;
  font-weight: 700;
`;

export const CompareTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;

  th, td {
    padding: 0.5rem 0.4rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
    text-align: center;
    vertical-align: middle;
  }

  th {
    color: ${({ theme }) => theme.colors.textSub};
    font-weight: 600;
  }

  td:first-child, th:first-child {
    text-align: left;
  }
`;

export const ClickableRow = styled.tr`
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.bgGray};
  }
`;

export const MarkdownBox = styled.div`
  padding: 0.75rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  font-size: 0.85rem;
  max-height: 320px;
  overflow-y: auto;
`;
