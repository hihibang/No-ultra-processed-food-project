import { useEffect } from 'react';
import styled from 'styled-components';
import { useViewMode } from '../../hooks/useViewMode';
import TopBanner from './TopBanner';
import Header from './Header';
import Footer from './Footer';
import Toast from '../Common/Toast';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
`;

function MainContainer({ children, onSearch }) {
  const { viewMode } = useViewMode();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewMode]);

  return (
    <LayoutWrapper>
      <TopBanner />
      <Header onSearch={onSearch} />
      <MainContent>
        {children}
      </MainContent>
      <Footer />
      <Toast />
    </LayoutWrapper>
  );
}

export default MainContainer;
