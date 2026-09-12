import styled from 'styled-components';
import { flexBetween, flexCenter, containerMax } from '../../../styles/mixins';

export const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky};
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

export const HeaderInner = styled.div`
  ${containerMax}
  ${flexBetween}
  gap: ${({ theme }) => theme.spacing.lg};
  padding: 0.75rem 1.5rem;
`;

export const BrandGroup = styled.div`
  ${flexCenter}
  gap: ${({ theme }) => theme.spacing.md};
  flex-shrink: 0;
`;

export const BrandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  font-family: inherit;

  &:hover {
    opacity: 0.8;
  }
`;

export const LogoSymbol = styled.span`
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  font-size: 1.15rem;
`;

export const LogoTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  color: ${({ theme }) => theme.colors.textMain};
  letter-spacing: -0.5px;
`;

export const AIBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  padding: 0.35rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
`;

export const ViewSwitchPill = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.bgGray};
  padding: 0.15rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

export const SwitchButton = styled.button`
  padding: 0.35rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textSub};
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  transition: all 0.15s ease;

  &.active {
    background-color: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
    box-shadow: ${({ theme }) => theme.shadows.light};
  }
`;

export const AuthGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

export const UserBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.bgGray};
  color: ${({ theme }) => theme.colors.textMain};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  padding: 0.35rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

export const CartButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 0.85rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: inherit;
  position: relative;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export const WishlistButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  position: relative;
  font-family: inherit;

  &:hover {
    background-color: ${({ theme }) => theme.colors.bgGray};
  }
`;

export const CounterBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: ${({ theme, isRed }) => (isRed ? '#dc2626' : theme.colors.primary)};
  color: ${({ theme }) => theme.colors.white};
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;
