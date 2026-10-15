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
  width: 100%;
  padding: 0.75rem 1.5rem;
`;

/* [왼쪽 영역] 로고, 검색창, 네비게이션 묶음 */
export const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
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

export const LogoSymbol = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #009245;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
    color: #ffffff;
  }
`;

export const BrandTitleGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

export const LogoTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  color: ${({ theme }) => theme.colors.textMain};
  letter-spacing: -0.5px;
`;

export const SubTitle = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: #666;
  white-space: nowrap;
  margin-top: 1px;
`;

/* 검색창 래퍼 */
export const SearchBoxWrapper = styled.div`
  width: 280px;
  flex-shrink: 0;
`;

/* 네비게이션 탭 Pill */
export const ViewSwitchPill = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.bgGray};
  padding: 0.2rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

export const SwitchButton = styled.button`
  padding: 0.35rem 0.85rem;
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
  white-space: nowrap;
  transition: all 0.15s ease;

  &.active {
    background-color: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
    box-shadow: ${({ theme }) => theme.shadows.light};
  }
`;

/* [중앙 여백 Spacer] */
export const Spacer = styled.div`
  flex: 1;
`;

/* [오른쪽 영역] 회원 및 위시리스트 */
export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
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
  cursor: pointer;
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