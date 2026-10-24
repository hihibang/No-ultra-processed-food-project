import styled from 'styled-components';

export const ModalTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  color: ${({ theme }) => theme.colors.textMain};
  margin: 0 0 4px 0;
  padding-right: 32px;
`;

export const ModalMeta = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 16px 0;
`;

export const Notice = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSub};
  background: ${({ theme }) => theme.colors.bgGray};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 8px 12px;
  margin: 0 0 16px 0;
`;

export const Message = styled.p`
  padding: 40px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSub};
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

export const ResultTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textMain};
`;

export const Th = styled.th`
  padding: 12px;
  vertical-align: top;
  text-align: center;
  min-width: 170px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

export const RowLabel = styled.th`
  padding: 10px 12px;
  text-align: left;
  white-space: nowrap;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textSub};
  background: ${({ theme }) => theme.colors.bgGray};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

export const Td = styled.td`
  padding: 10px 12px;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  font-weight: ${({ $highlight, theme }) =>
    $highlight ? theme.typography.fontWeight.heavy : theme.typography.fontWeight.normal};
  color: ${({ $highlight, theme }) => ($highlight ? theme.colors.primary : theme.colors.textMain)};
  background: ${({ $highlight }) => ($highlight ? '#ecfdf5' : 'transparent')};
`;

export const ItemImage = styled.img`
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: #f9fafb;
  margin-bottom: 6px;
`;

export const ItemName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: 2px;
`;

export const ItemCompany = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const ScoreBadge = styled.span`
  display: inline-block;
  min-width: 64px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ $color }) => $color};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
`;

export const NovaChip = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ $color, theme }) => $color ?? theme.colors.textSub}; /* ✅ theme 추가 */
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

export const BreakdownList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const BreakdownItem = styled.li`
  color: ${({ theme }) => theme.colors.textSub};
`;

export const DetailText = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;
