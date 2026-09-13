import styled from 'styled-components';

export const CatalogWrapper = styled.div`
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
  padding: 1.5rem 1.75rem;
  box-sizing: border-box;
`;

export const CatalogHeader = styled.header`
  margin-bottom: 1.5rem;

  h1 {
    font-size: 1.6rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors?.textMain || '#0f172a'};
    margin: 0 0 0.35rem 0;
  }

  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors?.textSub || '#64748b'};
    margin: 0;
  }
`;

export const CatalogLayout = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  width: 100%;
`;

export const MainContent = styled.main`
  flex: 1;
  min-width: 0;
`;

export const CatalogActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const ActiveChipsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
`;

export const FilterChip = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  padding: 0.38rem 0.9rem;
  min-height: 32px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  line-height: 1;
  transition: all 0.15s ease;

  border: 1.5px solid ${({ theme }) => theme.colors?.primary || '#059669'};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors?.primary || '#059669' : '#ffffff'};
  color: ${({ theme, $active }) =>
    $active ? '#ffffff' : theme.colors?.primary || '#059669'};

  .remove-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 6px;
    font-size: 0.72rem;
    line-height: 1;
    color: inherit;
    opacity: 0.8;
    transition: opacity 0.15s ease;
  }

  &:hover {
    background-color: ${({ theme, $active }) =>
    $active ? theme.colors?.primary || '#059669' : '#ecfdf5'};

    .remove-icon {
      opacity: 1;
    }
  }
`;

export const ChipColorDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  display: inline-block;
  margin-right: 5px;
  flex-shrink: 0;
`;

export const ClearAllButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  text-decoration: underline;

  &:hover {
    color: #ef4444;
  }
`;

export const SortAndCountWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors?.textSub || '#64748b'};
`;

export const ProductCount = styled.span`
  strong {
    color: ${({ theme }) => theme.colors?.textMain || '#0f172a'};
    font-weight: 700;
  }
`;

export const SortSelectWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ theme }) => theme.colors?.textMain || '#0f172a'};

  select {
    border: none;
    background: transparent;
    font-size: 0.82rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.textMain || '#0f172a'};
    cursor: pointer;
    outline: none;
  }
`;

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1536px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  @media (max-width: 1280px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;