import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: #888;
  cursor: pointer;
  padding: 0;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #15803d;
  }
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
`;

export const SearchSection = styled.div`
  margin-bottom: 32px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #15803d;
  }

  &::placeholder {
    color: #bbb;
  }
`;

export const FilterSection = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  overflow-x: auto;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 2px;
  }
`;

export const FilterTab = styled.button`
  background: ${(props) => (props.isActive ? '#15803d' : 'transparent')};
  color: ${(props) => (props.isActive ? 'white' : '#888')};
  border: 1px solid ${(props) => (props.isActive ? '#15803d' : '#e5e7eb')};
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;

  &:hover {
    border-color: #15803d;
    color: #15803d;
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

export const EmptyMessage = styled.div`
  text-align: center;
  padding: 80px 20px;
  font-size: 16px;
  color: #999;
`;
