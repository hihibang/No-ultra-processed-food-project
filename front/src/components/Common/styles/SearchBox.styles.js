import styled from 'styled-components';
import { flexCenter } from '../../../styles/mixins';

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  max-width: 750px;
`;

export const SearchBoxWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  padding: 0.25rem 0.5rem 0.25rem 1rem;
  background-color: ${({ theme }) => theme.colors.white};
  flex: 1;
`;

export const SearchInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textMain};
  background: transparent;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const SearchButton = styled.button`
  ${flexCenter}
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 1.1rem;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export const SearchHints = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSub};
  white-space: nowrap;
  flex-shrink: 0;
`;

export const HintLabel = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

export const HintTag = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSub};
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  font-family: inherit;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;
