import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { recommendationApi, logInteraction } from '../../api/recommendationApi';
import { useWishlistToggle } from '../../hooks/useWishlistToggle';
import { useCart } from '../../hooks/useCart';
import { ModalOverlay, ModalContent, ModalHeader, ModalTitle, CloseButton, ModalBody } from '../Common/styles/ProductDetailModal.styles';
import {
  Badge,
  BadgeRow,
  BestCell,
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

// 성분표에서 강조할 지표: 값이 클수록 좋은지 여부 (비교함 결과와 같은 기준)
const BEST_METRICS = [
  { key: 'healthScore', getValue: (item) => item.healthScore, higherIsBetter: true },
  { key: 'calories', getValue: (item) => item.nutrition?.calories, higherIsBetter: false },
  { key: 'sugars', getValue: (item) => item.nutrition?.sugars, higherIsBetter: false },
  { key: 'sodium', getValue: (item) => item.nutrition?.sodium, higherIsBetter: false },
];

// 후보 중 지표별 가장 좋은 상품의 reportNo 집합 (모든 값이 같으면 강조하지 않음)
// 반환: { [metricKey]: Set<reportNo> }
const getBestByMetric = (candidates) => {
  const result = {};
  BEST_METRICS.forEach(({ key, getValue, higherIsBetter }) => {
    const values = candidates.map(item => Number(getValue(item) ?? 0));
    if (candidates.length < 2 || values.every(value => value === values[0])) {
      result[key] = new Set();
      return;
    }
    const target = higherIsBetter ? Math.max(...values) : Math.min(...values);
    result[key] = new Set(candidates.filter((_, i) => values[i] === target).map(item => item.reportNo));
  });
  return result;
};

// 하나의 상품 행: 건강 점수, 영양 스펙, 선택률 게이지
function CompareRow({ item, baseNutrition, best, onOpen }) {
  const { isInWishlist } = useCart();
  const toggleWishlist = useWishlistToggle();
  const inWishlist = isInWishlist(item.reportNo);

  return (
    <ClickableRow onClick={() => onOpen(item)}>
      <td>
        <strong>{item.productName}</strong>
        <div><MutedText>{item.companyName}</MutedText></div>
      </td>
      <BestCell $best={best.healthScore.has(item.reportNo)}>
        {item.healthScore}점
        {item.healthDiff !== undefined && item.healthDiff !== null && (
          <div><MutedText>기준 대비 {signed(item.healthDiff)}</MutedText></div>
        )}
      </BestCell>
      <td>NOVA {item.novaGroup}</td>
      <BestCell $best={best.calories.has(item.reportNo)}>
        {item.nutrition.calories}kcal ({signed(Math.round((item.nutrition.calories - baseNutrition.calories) * 10) / 10)})
      </BestCell>
      <BestCell $best={best.sugars.has(item.reportNo)}>{item.nutrition.sugars}g</BestCell>
      <BestCell $best={best.sodium.has(item.reportNo)}>{item.nutrition.sodium}mg</BestCell>
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

  // 성분 강조는 기준 상품 + 비슷한 상품 3개(4가지 후보) 안에서만 비교한다
  const candidates = data ? [data.baseProduct, ...data.alternatives] : [];
  const best = getBestByMetric(candidates);
  const baseBest = data ? Object.fromEntries(
    BEST_METRICS.map(({ key }) => [key, best[key].has(data.baseProduct.reportNo)]),
  ) : {};

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
                      <BestCell $best={baseBest.healthScore}>{data.baseProduct.healthScore}점</BestCell>
                      <td>NOVA {data.baseProduct.novaGroup}</td>
                      <BestCell $best={baseBest.calories}>{data.baseProduct.nutrition.calories}kcal</BestCell>
                      <BestCell $best={baseBest.sugars}>{data.baseProduct.nutrition.sugars}g</BestCell>
                      <BestCell $best={baseBest.sodium}>{data.baseProduct.nutrition.sodium}mg</BestCell>
                      <td>—</td>
                      <td />
                    </tr>
                    {rows.map(item => (
                      <CompareRow
                        key={item.reportNo}
                        item={item}
                        baseNutrition={data.baseProduct.nutrition}
                        best={best}
                        onOpen={handleOpenItem}
                      />
                    ))}
                  </tbody>
                </CompareTable>
              </div>

              {rows.length === 0 && <MutedText>비교할 비슷한 상품이 아직 없어요.</MutedText>}

              <BadgeRow>
                <Badge>👥 선택률 = 기준 상품을 찜한 고객 중 해당 상품도 찜한 비율</Badge>
                <Badge>✅ 강조 = 기준 + 비슷한 상품 4개 중 지표별 가장 좋은 값</Badge>
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
