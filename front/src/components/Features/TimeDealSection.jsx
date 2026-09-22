import ProductCard from '../Common/ProductCard';
import { SAMPLE_DEALS } from '../../data/TimeDealSection.data';
import {
  TimeDealSectionWrapper,
  SectionHeader,
  SectionLabel,
  ViewAllButton,
  ProductGrid,
} from './styles/TimeDealSection.styles';

function TimeDealSection({ onViewAll }) {
  return (
    <TimeDealSectionWrapper>
      <SectionHeader>
        <div>
          <SectionLabel>🔥 오늘의 특가</SectionLabel>
          <h2>⏰ 타임딜</h2>
        </div>
        <ViewAllButton onClick={onViewAll}>
          전체 보기 →
        </ViewAllButton>
      </SectionHeader>
      <ProductGrid>
        {SAMPLE_DEALS.map(deal => (
          <ProductCard key={deal.id} product={deal} />
        ))}
      </ProductGrid>
    </TimeDealSectionWrapper>
  );
}

export default TimeDealSection;