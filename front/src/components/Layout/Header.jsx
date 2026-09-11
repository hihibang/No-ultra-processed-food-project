import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { flexBetween, flexCenter, containerMax } from '../../styles/mixins';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useViewMode } from '../../hooks/useViewMode';
import SearchBox from '../Common/SearchBox';
import Button from '../Common/Button';
import Badge from '../Common/Badge';
import AuthModal from '../Auth/AuthModal';

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky};
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const HeaderInner = styled.div`
  ${containerMax}
  ${flexBetween}
  gap: ${({ theme }) => theme.spacing.lg};
  padding: 0.75rem 1.5rem;
`;

const BrandGroup = styled.div`
  ${flexCenter}
  gap: ${({ theme }) => theme.spacing.sm};
  flex-shrink: 0;
`;

const BrandButton = styled.button`
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

const LogoSymbol = styled.span`
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

const LogoTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  color: ${({ theme }) => theme.colors.textMain};
  letter-spacing: -0.5px;
`;

const BadgeSubtitle = styled.span`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  padding: 0.2rem 0.6rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
`;

const ViewSwitchPill = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.bgGray};
  padding: 0.15rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const SwitchButton = styled.button`
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

const AuthGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const UserBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.bgGray};
  color: ${({ theme }) => theme.colors.textMain};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  padding: 0.35rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  padding: 0.5rem;
  position: relative;
  font-family: inherit;

  &:hover {
    opacity: 0.7;
  }
`;

const CounterBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: ${({ theme, isRed }) => (isRed ? '#dc2626' : theme.colors.primary)};
  color: ${({ theme }) => theme.colors.white};
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

function Header({ onSearch }) {
  const navigate = useNavigate();
  const { isLoggedIn, userName, logout } = useAuth();
  const { cartCount, wishlistCount } = useCart();
  const { viewMode, switchView } = useViewMode();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const handleViewChange = (mode) => {
    switchView(mode);
    navigate(mode === 'catalog' ? '/catalog' : '/');
  };

  const handleBrandClick = () => {
    navigate('/');
    switchView('home');
  };

  const handleLogout = () => {
    logout();
  };

  const handleLoginClick = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const handleSignupClick = () => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
  };

  return (
    <HeaderWrapper>
      <HeaderInner>
        <BrandGroup>
          <BrandButton onClick={handleBrandClick}>
            <LogoSymbol>O</LogoSymbol>
            <div>
              <LogoTitle>서비스 제목</LogoTitle>
              <BadgeSubtitle>서비스 부제목</BadgeSubtitle>
            </div>
          </BrandButton>
        </BrandGroup>

        <SearchBox
          onSearch={onSearch}
          hints={['#저당', '#비건', '#유기농', '#단백질', '#무첨가']}
          placeholder="피하고 싶은 원재료명이나 찾고 있는 성분을 검색해 보세요"
        />

        <HeaderActions>
          <ViewSwitchPill>
            <SwitchButton
              className={viewMode === 'home' ? 'active' : ''}
              onClick={() => handleViewChange('home')}
            >
              홈
            </SwitchButton>
            <SwitchButton
              className={viewMode === 'catalog' ? 'active' : ''}
              onClick={() => handleViewChange('catalog')}
            >
              식품 목록
            </SwitchButton>
          </ViewSwitchPill>

          <AuthGroup>
            {!isLoggedIn ? (
              <>
                <Button
                  variant="line"
                  size="sm"
                  onClick={handleSignupClick}
                >
                  회원가입
                </Button>
                <Button
                  variant="line"
                  size="sm"
                  onClick={handleLoginClick}
                >
                  로그인
                </Button>
              </>
            ) : (
              <>
                <UserBadge>{userName}</UserBadge>
                <Button variant="gray" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </>
            )}
          </AuthGroup>

          <IconButton>
            🛒
            {cartCount > 0 && <CounterBadge>{cartCount}</CounterBadge>}
          </IconButton>

          <IconButton>
            ❤️
            {wishlistCount > 0 && (
              <CounterBadge isRed>{wishlistCount}</CounterBadge>
            )}
          </IconButton>
        </HeaderActions>
      </HeaderInner>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </HeaderWrapper>
  );
}

export default Header;
