import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const BackLink = styled.button`
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(240px, 380px) 1fr;
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ProductImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background: #fff;
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const CompanyText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSub};
  font-size: 0.95rem;
`;

export const ProductTitle = styled.h1`
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textMain};
`;

export const ScoreRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

export const Chip = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: ${({ $color }) => ($color ? `${$color}22` : '#f3f4f6')};
  color: ${({ $color }) => $color || '#374151'};
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textMain};
`;

export const NutritionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  th, td {
    padding: 0.55rem 0.6rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
    text-align: left;
  }

  td:last-child {
    text-align: right;
    font-weight: 700;
  }
`;

export const MaterialTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  th, td {
    padding: 0.5rem 0.6rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
    text-align: left;
    vertical-align: middle;
  }

  th {
    font-size: 0.8rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textSub};
    background: ${({ theme }) => theme.colors.bgGray};
  }

  td:first-child {
    width: 56px;
    color: ${({ theme }) => theme.colors.textMuted};
    text-align: center;
  }
`;

export const AdditiveTag = styled.span`
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  vertical-align: middle;
  color: #c2410c;
  background: #fff7ed;
  border: 1px solid #fed7aa;
`;

export const Materials = styled.p`
  margin: 0;
  line-height: 1.6;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSub};
  word-break: keep-all;
`;

export const Muted = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSub};
  font-size: 0.95rem;
`;
