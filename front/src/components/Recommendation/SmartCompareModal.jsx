import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { recommendationApi, logInteraction } from '../../api/recommendationApi';
import { useWishlistToggle } from '../../hooks/useWishlistToggle';
import { useCart } from '../../hooks/useCart';
import { ModalOverlay, ModalContent, ModalHeader, ModalTitle, CloseButton, ModalBody } from '../Common/styles/ProductDetailModal.styles';
import {
  Badge,
  BadgeRow,
  ClickableRow,
  CompareTable,
  GaugeFill,
  GaugeTrack,
  HeadlineBadge,
  MutedText,
  SectionDesc,
  SectionTitle,
  SmallButton,
} from './styles/Recommendation.styles';

const signed = (value) => (value > 0 ? `+${value}` : `${value}`);

// 하나의 상품 행: 건강 점수, 영양 스펙, 선택률 게이지
function CompareRow({ item, baseNutrition, onOpen }) {
  const { isInWishlist } = useCart();
  const toggleWishlist = useWishlistToggle();
  const inWishlist = isInWishlist(item.reportNo);

  return (
    <ClickableRow onClick={() => onOpen(item)}>
      <td>
        <strong>{item.productName}</strong>
        <div><MutedText>{item.companyName}</MutedText></div>
      </td>
      <td>
        {item.healthScore}점
        {item.healthDiff !== undefined && item.healthDiff !== null && (
          <div><MutedText>기준 대비 {signed(item.healthDiff)}</MutedText></div>
        )}
      </td>
      <td>NOVA {item.novaGroup}</td>
      <td>{item.nutrition.calories}kcal ({signed(Math.round((item.nutrition.calories - baseNutrition.calories) * 10) / 10)})</td>
      <td>{item.nutrition.sugars}g</td>
      <td>{item.nutrition.sodium}mg</td>
      <td>
        {item.selectionRate !== null && item.selectionRate !== undefined ? (
          <>
            <GaugeTrack><GaugeFill $percent={item.selectionRate} /></GaugeTrack>
            <MutedText>{item.selectionRate}%</MutedText>
          </>
        ) : (
          <MutedText>데이터 부족</MutedText>
        )}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SmallButton
          type="button"
          $solid={inWishlist}
          onClick={() => toggleWishlist({ id: item.reportNo, name: item.productName, imageUrl: item.imageUrl })}
        >
          {inWishlist ? '❤️ 찜함' : '🤍 찜하기'}
        </SmallButton>
      </td>
    </ClickableRow>
  );
}

// ④ 스마트 상품 비교: 건강 점수가 비슷한 동종 제품 + 기준 상품을 찜한 고객의 선택률
function SmartCompareModal({ isOpen, productId, productName, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !productId) return undefined;
    let cancelled = false;
    setIsLoading(true);
    setError('');
    setData(null);
    recommendationApi.compareProduct(productId)
      .then(result => { if (!cancelled) setData(result); })
      .catch(err => { if (!cancelled) setError(err.message || '비교 정보를 불러오지 못했습니다.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, productId]);

  if (!isOpen) return null;

  // 비교 화면에서 상품을 클릭하면 행동 로그(클릭 2점)를 남긴다
  const handleOpenItem = (item) => {
    logInteraction({ itemType: 'product', itemId: item.reportNo, action: 'click' });
  };

  const rows = data ? [...data.alternatives, ...data.topSelected.filter(
    (top) => !data.alternatives.some(alt => alt.reportNo === top.reportNo),
  )] : [];

  return createPortal(
    <ModalOverlay onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>🔄 스마트 상품 비교 · {productName}</ModalTitle>
          <CloseButton onClick={onClose} aria-label="닫기">✕</CloseButton>
        </ModalHeader>

        <ModalBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isLoading && <MutedText>비교 정보를 불러오는 중입니다...</MutedText>}
          {error && <MutedText>{error}</MutedText>}

          {data && (
            <>
              {data.headline ? (
                <HeadlineBadge>👥 {data.headline}</HeadlineBadge>
              ) : (
                <MutedText>
                  {data.sampleSize > 0
                    ? '이 상품을 찜한 고객이 아직 다른 상품을 고르지 않았어요.'
                    : '이 상품을 찜한 고객 데이터가 아직 없어 선택률은 표시되지 않아요.'}
                </MutedText>
              )}

              <div>
                <SectionTitle>건강 점수가 비슷한 동종 제품</SectionTitle>
                <SectionDesc>기준 상품 건강 점수 {data.baseProduct.healthScore}점 · NOVA {data.baseProduct.novaGroup}</SectionDesc>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <CompareTable>
                  <thead>
                    <tr>
                      <th>상품</th>
                      <th>건강 점수</th>
                      <th>NOVA</th>
                      <th>열량</th>
                      <th>당류</th>
                      <th>나트륨</th>
                      <th>👥 선택률</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#f0fdf4' }}>
                      <td><strong>{data.baseProduct.productName}</strong> <Badge>기준</Badge></td>
                      <td>{data.baseProduct.healthScore}점</td>
                      <td>NOVA {data.baseProduct.novaGroup}</td>
                      <td>{data.baseProduct.nutrition.calories}kcal</td>
                      <td>{data.baseProduct.nutrition.sugars}g</td>
                      <td>{data.baseProduct.nutrition.sodium}mg</td>
                      <td>—</td>
                      <td />
                    </tr>
                    {rows.map(item => (
                      <CompareRow
                        key={item.reportNo}
                        item={item}
                        baseNutrition={data.baseProduct.nutrition}
                        onOpen={handleOpenItem}
                      />
                    ))}
                  </tbody>
                </CompareTable>
              </div>

              {rows.length === 0 && <MutedText>비교할 비슷한 상품이 아직 없어요.</MutedText>}

              <BadgeRow>
                <Badge>👥 선택률 = 기준 상품을 찜한 고객 중 해당 상품도 찜한 비율</Badge>
                {data.sampleSize > 0 && <Badge>표본 {data.sampleSize}명</Badge>}
              </BadgeRow>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>,
    document.body,
  );
}

export default SmartCompareModal;
