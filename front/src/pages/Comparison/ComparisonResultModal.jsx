import { useEffect, useState } from 'react';
import Modal from '../../components/Common/Modal';
import { useToast } from '../../hooks/useToast';
import { comparisonApi } from '../../api/comparisonApi';
import {
  ModalTitle,
  ModalMeta,
  Notice,
  Message,
  TableWrapper,
  ResultTable,
  Th,
  RowLabel,
  Td,
  ItemImage,
  ItemName,
  ItemCompany,
  ScoreBadge,
  NovaChip,
  BreakdownList,
  BreakdownItem,
  DetailText,
} from './styles/ComparisonResultModal.styles';

// higherIsBetter: 값이 클수록 좋은 항목인지 여부
const NUTRITION_ROWS = [
  { key: 'calories', label: '칼로리', unit: 'kcal', higherIsBetter: false },
  { key: 'sugars', label: '당류', unit: 'g', higherIsBetter: false },
  { key: 'sodium', label: '나트륨', unit: 'mg', higherIsBetter: false },
  { key: 'saturatedFat', label: '포화지방', unit: 'g', higherIsBetter: false },
  { key: 'protein', label: '단백질', unit: 'g', higherIsBetter: true },
];

const scoreColor = (score) => {
  if (score >= 70) return '#16a34a';
  if (score >= 40) return '#f59e0b';
  return '#dc2626';
};

const formatNumber = (value) =>
  Number(value ?? 0).toLocaleString('ko-KR', { maximumFractionDigits: 1 });

// 가장 좋은 값의 인덱스 목록 (모든 값이 같거나 items가 비어있으면 강조 안함)
const getBestIndexes = (items, key, higherIsBetter) => {
  if (!items || items.length < 2) return new Set();
  const values = items.map((item) => Number(item?.nutrition?.[key] ?? 0));
  const target = higherIsBetter ? Math.max(...values) : Math.min(...values);
  if (values.every((value) => value === target)) return new Set();
  return new Set(values.flatMap((value, index) => (value === target ? [index] : [])));
};

function ComparisonResultModal({ isOpen, onClose, comparisonId, data, createdAtLabel }) {
  const { showToast } = useToast();
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // 1. 직접 전달받은 data 객체가 있는 경우 (비교함 페이지에서 즉시 실행 시)
    if (data) {
      setDetail(data);
      setStatus('ready');
      return;
    }

    // 2. comparisonId를 통한 비로그/히스토리 조회인 경우
    if (comparisonId != null) {
      let cancelled = false;
      setStatus('loading');
      setDetail(null);

      comparisonApi
        .detail(comparisonId)
        .then((resData) => {
          if (cancelled) return;
          setDetail(resData);
          setStatus('ready');
        })
        .catch((error) => {
          if (cancelled) return;
          const msg = error?.response?.data?.detail || error.message || '결과를 불러오지 못했습니다.';
          setErrorMessage(msg);
          setStatus('error');
          showToast(msg, 'error');
        });

      return () => {
        cancelled = true;
      };
    }
  }, [isOpen, comparisonId, data, showToast]);

  const items = detail?.report?.items ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="960px">
      <ModalTitle>비교 결과</ModalTitle>
      {createdAtLabel && <ModalMeta>{createdAtLabel} 비교</ModalMeta>}

      {status === 'loading' && <Message>결과를 분석 및 불러오는 중입니다...</Message>}
      {status === 'error' && <Message>{errorMessage}</Message>}

      {status === 'ready' && items.length > 0 && (
        <>
          {detail?.isRecalculated && (
            <Notice>과거 기록은 현재 최신 데이터 기준으로 다시 계산되었습니다.</Notice>
          )}

          <TableWrapper>
            <ResultTable>
              <thead>
                <tr>
                  <Th />
                  {items.map((item, idx) => (
                    <Th key={item.reportNo || item.food_id || idx}>
                      <ItemImage
                        src={item.imageUrl || item.image_url || '/images/div.relative.png'}
                        alt={item.productName || item.product_name}
                      />
                      <ItemName>{item.productName || item.product_name}</ItemName>

                      <ItemCompany>{item.companyName || item.company_name}</ItemCompany>
                    </Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <RowLabel>건강 점수 (100점)</RowLabel>
                  {items.map((item, idx) => (
                    <Td key={item.reportNo || idx}>
                      <ScoreBadge $color={scoreColor(item.healthScore ?? 0)}>
                        {item.healthScore ?? 0}점
                      </ScoreBadge>
                    </Td>
                  ))}
                </tr>

                <tr>
                  <RowLabel>NOVA 등급</RowLabel>
                  {items.map((item, idx) => (
                    <Td key={item.reportNo || idx}>
                      <NovaChip $color={item.badgeColor}>
                        NOVA {item.novaGroup} · {item.statusText}
                      </NovaChip>
                    </Td>
                  ))}
                </tr>

                <tr>
                  <RowLabel>감점 내역</RowLabel>
                  {items.map((item, idx) => {
                    const breakdown = item.scoreBreakdown || {};
                    const detectedMarkers = item.detectedMarkers || [];
                    const appliedWarnings = breakdown.appliedWarnings || [];

                    return (
                      <Td key={item.reportNo || idx}>
                        <BreakdownList>
                          <BreakdownItem>NOVA −{breakdown.novaDeduction ?? 0}</BreakdownItem>
                          <BreakdownItem>
                            UPF 마커 −{breakdown.upfDeduction ?? 0}
                            {detectedMarkers.length > 0 && (
                              <DetailText>{detectedMarkers.join(', ')}</DetailText>
                            )}
                          </BreakdownItem>
                          <BreakdownItem>
                            영양 경고 −{breakdown.nutritionDeduction ?? 0}
                            {appliedWarnings.length > 0 && (
                              <DetailText>{appliedWarnings.join(', ')}</DetailText>
                            )}
                          </BreakdownItem>
                        </BreakdownList>
                      </Td>
                    );
                  })}
                </tr>

                {NUTRITION_ROWS.map((row) => {
                  const bestIndexes = getBestIndexes(items, row.key, row.higherIsBetter);
                  return (
                    <tr key={row.key}>
                      <RowLabel>{row.label}</RowLabel>
                      {items.map((item, index) => (
                        <Td key={item.reportNo || index} $highlight={bestIndexes.has(index)}>
                          {formatNumber(item.nutrition?.[row.key])}
                          {row.unit}
                        </Td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </ResultTable>
          </TableWrapper>
        </>
      )}

      {status === 'ready' && items.length === 0 && (
        <Message>비교할 상품 정보가 존재하지 않습니다.</Message>
      )}
    </Modal>
  );
}

export default ComparisonResultModal;
