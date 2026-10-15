import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useViewMode } from '../../hooks/useViewMode';
import { getIcon } from '../../constants/icons';
import SearchBox from '../Common/SearchBox';
import Button from '../Common/Button';
import AuthModal from '../Auth/AuthModal';
import {
  HeaderWrapper,
  HeaderInner,
  LeftGroup,
  BrandGroup,
  BrandButton,
  LogoSymbol,
  BrandTitleGroup,
  LogoTitle,
  SubTitle,
  SearchBoxWrapper,
  ViewSwitchPill,
  SwitchButton,
  Spacer,
  HeaderActions,
  AuthGroup,
  UserBadge,
  WishlistButton,
  CounterBadge,
} from './styles/Header.styles';

function Header({ onSearch }) {
  const navigate = useNavigate();
  const { isLoggedIn, userName, logout } = useAuth();
  const { wishlistCount } = useCart();
  const { viewMode, switchView } = useViewMode();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const handleViewChange = (mode) => {
    switchView(mode);
    if (mode === 'home') navigate('/');
    else if (mode === 'chat') navigate('/ai-chat');
    else if (mode === 'catalog') navigate('/catalog');
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
        {/* [왼쪽 영역] 로고 - 검색창 - 네비게이션 탭 */}
        <LeftGroup>
          <BrandGroup>
            <BrandButton onClick={handleBrandClick}>
              <LogoSymbol>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              </LogoSymbol>

              <BrandTitleGroup>
                <LogoTitle>PingPong</LogoTitle>
                <SubTitle>여러 번의 클릭에서 단 한 번의 선택을 찾다</SubTitle>
              </BrandTitleGroup>
            </BrandButton>
          </BrandGroup>

          <SearchBoxWrapper>
            <SearchBox onSearch={onSearch} />
          </SearchBoxWrapper>

          <ViewSwitchPill>
            <SwitchButton
              className={viewMode === 'home' ? 'active' : ''}
              onClick={() => handleViewChange('home')}
            >
              홈
            </SwitchButton>
            <SwitchButton
              className={viewMode === 'chat' ? 'active' : ''}
              onClick={() => handleViewChange('chat')}
            >
              AI 챗봇
            </SwitchButton>
            <SwitchButton
              className={viewMode === 'catalog' ? 'active' : ''}
              onClick={() => handleViewChange('catalog')}
            >
              상품 목록
            </SwitchButton>
          </ViewSwitchPill>
        </LeftGroup>

        {/* [중앙 여백] */}
        <Spacer />

        {/* [오른쪽 영역] 회원 기능 & 위시리스트 */}
        <HeaderActions>
          <AuthGroup>
            {!isLoggedIn ? (
              <>
                <Button variant="line" size="sm" onClick={handleSignupClick}>
                  회원가입
                </Button>
                <Button variant="line" size="sm" onClick={handleLoginClick}>
                  로그인
                </Button>
              </>
            ) : (
              <>
                <UserBadge onClick={() => navigate('/mypage')}>
                  {userName} 님
                </UserBadge>
                <Button variant="line" size="sm" onClick={() => navigate('/mypage')}>
                  마이페이지
                </Button>
                <Button variant="gray" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </>
            )}
          </AuthGroup>

          <WishlistButton onClick={() => navigate('/wishlist')} title="위시리스트">
            <span>{getIcon('heart')}</span>
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