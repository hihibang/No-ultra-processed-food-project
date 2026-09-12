import styled from 'styled-components';
import { containerMax } from '../../styles/mixins';

export const CatalogWrapper = styled.div`
  ${containerMax}
  padding: 2rem 1.5rem;
`;

export const CatalogHeader = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
    color: ${({ theme }) => theme.colors.textMain};
    margin-bottom: 0.5rem;
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.textSub};
  }
`;

/* 2열 레이아웃 컨테이너 */
export const CatalogLayout = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
`;

/* 좌측 카테고리 사이드바 */
export const CategorySidebar = styled.aside`
  width: 200px;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borderRadius.md || '0.75rem'};
  padding: 1.25rem 0.75rem;

  h3 {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    padding-left: 0.5rem;
    color: ${({ theme }) => theme.colors.textMain};
  }
`;

export const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const CategoryItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  border: none;
  background-color: ${({ theme, $active }) => ($active ? '#ecfdf5' : 'transparent')};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textMain)};
  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme, $active }) => ($active ? '#ecfdf5' : theme.colors.bgGray || '#f3f4f6')};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

/* 우측 상품 영역 */
export const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const FiltersWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

export const FilterButton = styled.button`
  padding: 0.4rem 0.9rem;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.borderColor)};
  background-color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.white)};
  color: ${({ theme, $active }) => ($active ? theme.colors.white : theme.colors.textMain)};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
`;