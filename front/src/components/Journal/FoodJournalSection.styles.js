import styled from 'styled-components';

export const SectionContainer = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
`;

export const ViewAllButton = styled.button`
  background: #15803d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #166534;
  }

  @media (max-width: 768px) {
    width: 100%;
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
