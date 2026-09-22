import { useState } from 'react';
import {
  BannerWrapper,
  BannerInner,
  BannerText,
  BadgeWelcome,
  TextButton,
  CloseButton,
} from './styles/TopBanner.styles';

function TopBanner({ onCouponClick, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleCouponClick = () => {
    onCouponClick?.();
  };

  return (
    // $를 붙여 실제 DOM(HTML div)으로 prop이 전달되지 않도록 방지
    <BannerWrapper $isVisible={isVisible}>
      <BannerInner>
        <BannerText>
          <BadgeWelcome>WELCOME</BadgeWelcome>
          <TextButton onClick={handleCouponClick}>혜택 받기 →</TextButton>
        </BannerText>
      </BannerInner>
    </BannerWrapper>
  );
}

export default TopBanner;