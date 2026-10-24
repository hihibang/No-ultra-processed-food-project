import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  color: ${({ theme }) => theme.colors.textMain};
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textSub};
  margin: 0;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSub};
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: #fff;
`;

export const CompareTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textMain};
`;

export const Th = styled.th`
  padding: 16px;
  vertical-align: top;
  text-align: center;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  min-width: 180px;
`;

export const Td = styled.td`
  padding: 12px 16px;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  color: ${({ theme }) => theme.colors.textMain};
`;

export const RowLabel = styled.td`
  padding: 12px 16px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textSub};
  background: ${({ theme }) => theme.colors.bgGray};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  white-space: nowrap;
`;

export const ItemImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: #f9fafb;
  margin-bottom: 8px;
`;

export const ItemName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: 8px;
`;

export const ActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

export const Hint = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSub};
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;
