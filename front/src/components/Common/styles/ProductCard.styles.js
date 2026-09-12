import styled from 'styled-components';

export const CardWrapper = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 146, 69, 0.1);
  }
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  background-color: ${({ theme }) => theme.colors.bgGray};
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Badge = styled.span`
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  background-color: #dc2626;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  padding: 0.2rem 0.45rem;
  border-radius: 0.35rem;
  z-index: 5;
`;

export const WishlistButton = styled.button`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 2rem;
  height: 2rem;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid ${({ theme }) => theme.colors.borderColor || '#e5e7eb'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 6;
  color: ${({ theme, $isWished }) => ($isWished ? '#dc2626' : theme.colors.textSub || '#6b7280')};
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    transform: scale(1.1);
    color: #dc2626;
    border-color: #fca5a5;
    background-color: ${({ theme }) => theme.colors.white};
  }

  svg {
    width: 1.1rem;
    height: 1.1rem;
    display: block;
    fill: ${({ $isWished }) => ($isWished ? '#dc2626' : 'none')};
  }
`;

export const CartButton = styled.button`
  position: absolute;
  bottom: 0.6rem;
  right: 0.6rem;
  width: 2.25rem;
  height: 2.25rem;
  background-color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 6;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const CardInfo = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
`;

export const IngredientTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
`;

export const IngredientTag = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  background-color: #ecfdf5;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.15rem 0.45rem;
  border-radius: 0.3rem;
`;

export const ProductName = styled.h3`
  font-size: 0.95rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  line-height: 1.3;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.textMain};
`;

export const ProductSub = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSub};
  line-height: 1.3;
  margin: 0;
`;

export const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 0.75rem;
  padding-top: 0.65rem;
  border-top: 1px solid #f3f4f6;
`;

export const OriginalPrice = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-decoration: line-through;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const CurrentPrice = styled.span`
  font-size: 1.1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  color: ${({ theme }) => theme.colors.primary};
`;

export const Rating = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: #f59e0b;
`;