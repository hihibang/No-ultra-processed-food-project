import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { useViewMode } from '../hooks/useViewMode';
import { useCompare } from '../hooks/useCompare';
import MainContainer from '../components/Layout/MainContainer';
import HeroSection from '../components/Features/HeroSection';
import CategoriesSection from '../components/Features/CategoriesSection';
import CreatorGroupBuySection from '../components/Features/CreatorGroupBuySection';
import FoodJournalSection from '../components/Journal/FoodJournalSection';
import RecentProductsSection from '../components/Features/RecentProductsSection';
import CompareToast from '../components/Common/CompareToast';
import { CATEGORY_OPTIONS } from '../data/CatalogPage.data';

function HomePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { switchView } = useViewMode();
  const { showToast: showCompareToast, toastData, setShowToast } = useCompare();

  const handleSearch = (searchQuery) => {
    showToast(`'${searchQuery}'에 대해 검색하시겠습니까?`, 'success', 2000);
  };

  const handleHeroPopup = () => {
    showToast('🎁 쿠폰 팝업이 열렸습니다!', 'success');
  };

  const handleCatalogClick = () => {
    switchView('catalog');
    navigate('/catalog');
  };

  // 카탈로그에 없는 카테고리(예: 유기농)는 전체 목록으로 이동
  const handleCategoryClick = (category) => {
    const target = CATEGORY_OPTIONS.includes(category.title) ? category.title : '전체';
    switchView('catalog');
    navigate(target === '전체' ? '/catalog' : `/catalog?category=${encodeURIComponent(target)}`);
  };

  const handleViewAll = () => {
    switchView('catalog');
    navigate('/catalog');
  };

  const handleAIChat = () => {
    navigate('/ai-chat');
  };

  return (
    <>
      <MainContainer onSearch={handleSearch}>
        <HeroSection
          onPopupOpen={handleHeroPopup}
          onCatalogClick={handleCatalogClick}
          onAIChat={handleAIChat}
        />
        <CreatorGroupBuySection />
        <FoodJournalSection />
        <CategoriesSection onCategoryClick={handleCategoryClick} />
        <RecentProductsSection />
      </MainContainer>
      <CompareToast
        isOpen={showCompareToast}
        onClose={() => setShowToast(false)}
        productName={toastData.productName}
        compareCount={toastData.count}
        duration={2000}
      />
    </>
  );
}

export default HomePage;