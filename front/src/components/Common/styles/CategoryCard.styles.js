import styled from 'styled-components';
import { flexCenter } from '../../../styles/mixins';

export const CardWrapper = styled.button`
  ${flexCenter}
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem 0.25rem;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borderRadius.md || '0.75rem'};
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  min-width: 0;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 146, 69, 0.1);
    transform: translateY(-2px);
  }
`;

export const IconWrapper = styled.div`
  font-size: 1.6rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  img, svg {
    width: 1.75rem;
    height: 1.75rem;
    object-fit: contain;
  }
`;

export const CategoryTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textMain};
  margin: 0;
  text-align: center;
  white-space: nowrap;
  line-height: 1.2;
`;

export const CategorySubtitle = styled.p`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.textSub};
  margin: 0;
  text-align: center;
  white-space: nowrap;
  line-height: 1.2;
`;
