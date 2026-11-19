import React, { useState } from 'react';
import { logInteraction } from '../../api/recommendationApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import CrossDomainSection from '../Recommendation/CrossDomainSection';
import {
  SectionWrapper,
  SectionHeader,
  SectionLabel,
  GridContainer,
  CardWrapper,
  CardImage,
  DayBadge,
  PriceBadge,
  CardContent,
  CardTitle,
  CardDescription,
  CardButton,
} from './styles/CreatorGroupBuySection.styles';

function CreatorGroupBuySection() {
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [selectedCreatorId, setSelectedCreatorId] = useState(null);
  const [wishedCreatorIds, setWishedCreatorIds] = useState([]);

  const creators = [
    {
      id: 1,
      name: '건강한 요리 크리에이터',
      title: '제철 재료로 만드는 건강한 한끼',
      description: '신선한 제철 재료를 활용한 간단하고 맛있는 요리법을 소개합니다.',
      emoji: '👨‍🍳',
    },
    {
      id: 2,
      name: '유기농 라이프 크리에이터',
      title: '유기농 식재료로 시작하는 웰빙',
      description: '지속 가능하고 건강한 삶을 위한 유기농 식재료 활용법을 공유합니다.',
      emoji: '🌱',
    },
  ];

  const groupBuys = [
    {
      id: 1,
      name: '프리미엄 한우 공동구매',
      title: '최고급 한우 특가 공구 진행 중',
      description: '엄선된 최고급 한우를 공구가로 특가에 만나보세요. D-3 마감!',
      daysLeft: 3,
      discount: '30% OFF',
      url: 'https://example.com/groupbuy/1',
      emoji: '🥩',
    },
    {
      id: 2,
      name: '유기농 채소 구독 박스',
      title: '신선한 유기농 제철 채소 공구',
      description: '농장에서 직송되는 신선한 유기농 채소를 정기적으로 배송받으세요.',
      daysLeft: 7,
      discount: '25% OFF',
      url: 'https://example.com/groupbuy/2',
      emoji: '🥬',
    },
  ];

  const handleCreatorClick = (creator) => {
    console.log('크리에이터 클릭:', creator.name);
    setSelectedCreatorId(creator.id);
  };

  // 크리에이터 찜: 행동 로그(influencer wish)를 남기고 화면 상태를 바꾼다 (찜 목록 조회 API는 아직 없어 새로고침 시 초기화)
  const handleCreatorWish = (creator) => {
    if (!isLoggedIn) {
      showToast('로그인 후 크리에이터를 찜할 수 있어요.', 'info');
      return;
    }
    const wished = wishedCreatorIds.includes(creator.id);
    setWishedCreatorIds(prev => (wished ? prev.filter(id => id !== creator.id) : [...prev, creator.id]));
    if (!wished) {
      logInteraction({ itemType: 'influencer', itemId: `creator-${creator.id}`, action: 'wish', label: creator.name });
    }
  };

  const activeCreator = creators.find(creator => creator.id === selectedCreatorId) ?? creators[0];

  return (
    <SectionWrapper>
      <SectionHeader>
        <div>
          <SectionLabel>🎥 크리에이터</SectionLabel>
          <h2>📚 추천 레시피 & 공구 정보</h2>
        </div>
      </SectionHeader>

      <GridContainer>
        {/* 1. 크리에이터 카드 목록 */}
        {creators.map((creator) => (
          <CardWrapper key={`creator-${creator.id}`}>
            <CardImage>{creator.emoji}</CardImage>
            <CardContent>
              <CardTitle>{creator.title}</CardTitle>
              <CardDescription>{creator.description}</CardDescription>
              <CardButton
                $variant="primary"
                size="sm"
                onClick={() => handleCreatorClick(creator)}
              >
                레시피 확인하기 →
              </CardButton>
              <CardButton
                size="sm"
                onClick={() => handleCreatorWish(creator)}
              >
                {wishedCreatorIds.includes(creator.id) ? '❤️ 찜함' : '🤍 크리에이터 찜하기'}
              </CardButton>
            </CardContent>
          </CardWrapper>
        ))}

        {/* 2. 공동구매 카드 목록 */}
        {groupBuys.map((groupBuy) => (
          <CardWrapper key={`groupbuy-${groupBuy.id}`}>
            <CardImage>
              {groupBuy.emoji}
              <DayBadge>D-{groupBuy.daysLeft}</DayBadge>
              <PriceBadge>{groupBuy.discount}</PriceBadge>
            </CardImage>
            <CardContent>
              <CardTitle>{groupBuy.title}</CardTitle>
              <CardDescription>{groupBuy.description}</CardDescription>
              <CardButton
                $variant="primary"
                size="sm"
                onClick={() => window.open(groupBuy.url, '_blank', 'noopener,noreferrer')}
              >
                공구 참여하기 🔗
              </CardButton>
            </CardContent>
          </CardWrapper>
        ))}
      </GridContainer>

      {/* ③ 인플루언서 팬덤 Cross-Domain 추천: 선택한 크리에이터를 찜한 사람들이 함께 찜한 상품·레시피 */}
      <CrossDomainSection
        targetType="influencer"
        targetId={`creator-${activeCreator.id}`}
        title={`${activeCreator.name} 팬들이 함께 찜한 상품 & 레시피`}
      />
    </SectionWrapper>
  );
}

export default CreatorGroupBuySection;