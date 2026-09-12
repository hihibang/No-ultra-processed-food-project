import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useViewMode } from '../../hooks/useViewMode';
import { getIcon } from '../../constants/icons';
import SearchBox from '../Common/SearchBox';
import Button from '../Common/Button';
import Badge from '../Common/Badge';
import AuthModal from '../Auth/AuthModal';
import {
  HeaderWrapper,
  HeaderInner,
  BrandGroup,
  BrandButton,
  LogoSymbol,
  LogoTitle,
  AIBadge,
  HeaderActions,
  ViewSwitchPill,
  SwitchButton,
  AuthGroup,
  UserBadge,
  CartButton,
  WishlistButton,
  CounterBadge,
} from './styles/Header.styles';

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
            <LogoTitle>서비스 제목</LogoTitle>
          </BrandButton>
          <AIBadge>AI</AIBadge>
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

          <CartButton onClick={() => navigate('/cart')}>
            <span>{getIcon('shoppingBag')}</span>
            <span>장바구니</span>
            {cartCount > 0 && <CounterBadge>{cartCount}</CounterBadge>}
          </CartButton>

          <WishlistButton onClick={() => navigate('/wishlist')}>
            <span>♡</span>
            {wishlistCount > 0 && (
              <CounterBadge isRed>{wishlistCount}</CounterBadge>
            )}
          </WishlistButton>
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