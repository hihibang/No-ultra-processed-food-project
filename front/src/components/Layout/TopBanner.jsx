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
    <BannerWrapper isVisible={isVisible}>
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
