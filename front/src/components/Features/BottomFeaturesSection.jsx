import { FEATURES } from '../../data/BottomFeaturesSection.data';
import {
  BottomFeaturesSectionWrapper,
  FeaturesGrid,
  FeatureCard,
  FeatureOverlay,
  FeatureCardContent,
  FeatureTag,
  FeatureTitle,
  FeatureDescription,
} from './styles/BottomFeaturesSection.styles';

function BottomFeaturesSection() {
  return (
    <BottomFeaturesSectionWrapper>
      <FeaturesGrid>
        {FEATURES.map(feature => (
          <FeatureCard
            key={feature.id}
            $bgImage={feature.bgImage}
            role="button"
            tabIndex={0}
          >
            <FeatureOverlay $isGreenTint={feature.isGreenTint} />
            <FeatureCardContent>
              <FeatureTag>{feature.tag}</FeatureTag>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCardContent>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </BottomFeaturesSectionWrapper>
  );
}

export default BottomFeaturesSection;