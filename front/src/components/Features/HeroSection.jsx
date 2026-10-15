import Button from '../Common/Button';
import {
  HeroSectionWrapper,
  HeroBanner,
  HeroContent,
  HeroButtons,
} from './styles/HeroSection.styles';

function HeroSection({ onPopupOpen, onCatalogClick, onAIChat }) {
  return (
    <HeroSectionWrapper>
      <HeroBanner>
        <HeroContent>
          <h1>내 주방 환경에 딱 맞는<br />맞춤형 AI 레시피 챗봇 출시!</h1>
          <p>AI가 당신의 주방 환경을 파악하고 맞춤형 레시피를 추천해줍니다. 이제 더 이상 고민하지 마세요!</p>
          <HeroButtons>
            <Button
              variant="primary"
              size="lg"
              onClick={onAIChat}
            >
              AI 레시피 체험하기 →
            </Button>
          </HeroButtons>
        </HeroContent>
      </HeroBanner>
    </HeroSectionWrapper>
  );
}

export default HeroSection;
