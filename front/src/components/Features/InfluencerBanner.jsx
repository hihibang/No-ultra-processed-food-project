import { SectionTitle, SectionDesc, Section, SmallButton } from '../Recommendation/styles/Recommendation.styles';

// 메인 화면의 인플루언서 진입 배너 (목록·레시피는 /influencers 에서 본다)
function InfluencerBanner({ onClick }) {
  return (
    <Section aria-label="인플루언서 페이지 안내">
      <SectionTitle>🎥 인플루언서 레시피 & 추천 상품</SectionTitle>
      <SectionDesc>좋아하는 크리에이터를 찜하고 검수된 레시피와 함께 찜하는 상품을 모아보세요.</SectionDesc>
      <div>
        <SmallButton type="button" $solid onClick={onClick}>인플루언서 보러 가기 →</SmallButton>
      </div>
    </Section>
  );
}

export default InfluencerBanner;
