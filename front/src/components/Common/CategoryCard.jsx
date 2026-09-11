import styled from 'styled-components';
import { flexCenter } from '../../styles/mixins';

const CardWrapper = styled.button`
  ${flexCenter}
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 146, 69, 0.1);
    transform: translateY(-2px);
  }
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  line-height: 1;
`;

const CategoryTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textMain};
  margin: 0;
  text-align: center;
`;

const CategorySubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSub};
  margin: 0;
`;

function CategoryCard({ icon, title, subtitle, onClick }) {
  return (
    <CardWrapper onClick={onClick}>
      <IconWrapper>{icon}</IconWrapper>
      <CategoryTitle>{title}</CategoryTitle>
      {subtitle && <CategorySubtitle>{subtitle}</CategorySubtitle>}
    </CardWrapper>
  );
}

export default CategoryCard;
