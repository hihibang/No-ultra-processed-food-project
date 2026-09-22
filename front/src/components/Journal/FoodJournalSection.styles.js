import styled from 'styled-components';

export const SectionContainer = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
`;

export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 48px;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const SectionLabel = styled.div`
  font-size: 14px;
  color: #888;
  font-weight: 500;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
`;

export const MainTitle = styled.h2`
  margin: 0;
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.3;
  max-width: 500px;
`;

export const ViewAllButton = styled.button`
  background: none;
  color: #15803d;
  border: none;
  padding: 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;
  white-space: nowrap;
  margin-top: 4px;

  &:hover {
    color: #166534;
  }

  @media (max-width: 768px) {
    margin-top: 16px;
  }
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
