import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useCompare } from '../../hooks/useCompare';
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
  CompareButton,
  CounterBadge,
} from './styles/Header.styles';

function Header({ onSearch }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // user 객체 또는 userName 둘 다 안전하게 대응
  const { isLoggedIn, user, userName, logout } = useAuth();
  const { wishlistCount } = useCart();
  const { compareCount } = useCompare();
  const { viewMode, switchView } = useViewMode();
  // AI 챗봇 페이지는 URL 기준으로 active 처리 (직접 접속/뒤로가기 시에도 표시되도록)
  const activeMode =
    pathname === '/ai-chat' ? 'chat' : pathname === '/catalog' ? 'catalog' : viewMode;
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  // 화면에 표기할 최종 사용자 이름 (user가 객체인 경우와 문자열인 경우 모두 대비)
  const displayName =
    typeof user === 'object' && user?.name
      ? user.name
      : typeof userName === 'string'
        ? userName
        : typeof user === 'string'
          ? user
          : '사용자';

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
              className={activeMode === 'home' ? 'active' : ''}
              onClick={() => handleViewChange('home')}
            >
              홈
            </SwitchButton>
            <SwitchButton
              className={activeMode === 'chat' ? 'active' : ''}
              onClick={() => handleViewChange('chat')}
            >
              AI 챗봇
            </SwitchButton>
            <SwitchButton
              className={activeMode === 'catalog' ? 'active' : ''}
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
                  {displayName} 님
                </UserBadge>
                <Button variant="gray" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
                <Button variant="line" size="sm" onClick={() => navigate('/mypage')}>
                  마이페이지
                </Button>
              </>
            )}
          </AuthGroup>

          <CompareButton onClick={() => navigate('/compare')} title="비교함">
            비교함
            {compareCount > 0 && (
              <CounterBadge>{compareCount}</CounterBadge>
            )}
          </CompareButton>

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