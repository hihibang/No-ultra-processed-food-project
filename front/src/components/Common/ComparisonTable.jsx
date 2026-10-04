import {
  ComparisonContainer,
  ComparisonHeader,
  ComparisonGrid,
  ComparisonRow,
  ComparisonLabel,
  ComparisonValue,
  HighlightCell,
  PingPongTipBox,
  TipTitle,
  TipText,
} from './styles/ComparisonTable.styles';

function ComparisonTable({ currentProduct, similarProduct, pingPongTip = '' }) {
  if (!currentProduct || !similarProduct) {
    return null;
  }

  const formatValue = (value, unit = '') => {
    if (value === null || value === undefined) return '정보 없음';
    return `${value}${unit}`;
  };

  const isBetter = (current, similar, higherIsBetter = true) => {
    if (current === null || similar === null) return null;
    if (higherIsBetter) {
      return current > similar ? 'current' : current < similar ? 'similar' : 'equal';
    } else {
      return current < similar ? 'current' : current > similar ? 'similar' : 'equal';
    }
  };

  const sugarBetter = isBetter(currentProduct.sugar, similarProduct.sugar, false);
  const proteinBetter = isBetter(currentProduct.protein, similarProduct.protein, true);

  return (
    <ComparisonContainer>
      <ComparisonHeader>
        <h3>🔄 유사 상품과의 스펙 1초 비교</h3>
        <p>같은 카테고리 인기 상품과 비교해보세요</p>
      </ComparisonHeader>

      <ComparisonGrid>
        {/* 비교 지표 행 */}
        <ComparisonRow>
          <ComparisonLabel>항목</ComparisonLabel>
          <HighlightCell $isHighlight={sugarBetter === 'current'}>
            <span className="product-name">{currentProduct.name}</span>
          </HighlightCell>
          <ComparisonValue>vs</ComparisonValue>
          <HighlightCell $isHighlight={sugarBetter === 'similar'}>
            <span className="product-name">{similarProduct.name}</span>
          </HighlightCell>
        </ComparisonRow>

        {/* 당류 비교 */}
        <ComparisonRow>
          <ComparisonLabel>🍬 당류</ComparisonLabel>
          <HighlightCell $isHighlight={sugarBetter === 'current'}>
            {formatValue(currentProduct.sugar, 'g')}
          </HighlightCell>
          <ComparisonValue>vs</ComparisonValue>
          <HighlightCell $isHighlight={sugarBetter === 'similar'}>
            {formatValue(similarProduct.sugar, 'g')}
          </HighlightCell>
        </ComparisonRow>

        {/* 단백질 비교 */}
        <ComparisonRow>
          <ComparisonLabel>💪 단백질</ComparisonLabel>
          <HighlightCell $isHighlight={proteinBetter === 'current'}>
            {formatValue(currentProduct.protein, 'g')}
          </HighlightCell>
          <ComparisonValue>vs</ComparisonValue>
          <HighlightCell $isHighlight={proteinBetter === 'similar'}>
            {formatValue(similarProduct.protein, 'g')}
          </HighlightCell>
        </ComparisonRow>

        {/* NOVA 등급 비교 */}
        <ComparisonRow>
          <ComparisonLabel>📊 NOVA 등급</ComparisonLabel>
          <ComparisonValue>
            Level {currentProduct.novaGrade || '정보 없음'}
          </ComparisonValue>
          <ComparisonValue>vs</ComparisonValue>
          <ComparisonValue>
            Level {similarProduct.novaGrade || '정보 없음'}
          </ComparisonValue>
        </ComparisonRow>

        {/* 조리 용이성 비교 */}
        {(currentProduct.preparationTime || similarProduct.preparationTime) && (
          <ComparisonRow>
            <ComparisonLabel>⏱️ 조리 시간</ComparisonLabel>
            <ComparisonValue>
              {formatValue(currentProduct.preparationTime, '분')}
            </ComparisonValue>
            <ComparisonValue>vs</ComparisonValue>
            <ComparisonValue>
              {formatValue(similarProduct.preparationTime, '분')}
            </ComparisonValue>
          </ComparisonRow>
        )}
      </ComparisonGrid>

      {pingPongTip && (
        <PingPongTipBox>
          <TipTitle>💡 핑퐁 팁 (One Select)</TipTitle>
          <TipText>{pingPongTip}</TipText>
        </PingPongTipBox>
      )}
    </ComparisonContainer>
  );
}

export default ComparisonTable;
