import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainContainer from '../components/Layout/MainContainer';
import Button from '../components/Common/Button';
import SmartCompareModal from '../components/Recommendation/SmartCompareModal';
import { foodApi } from '../api/foodApi';
import { logInteraction } from '../api/recommendationApi';
import { useCart } from '../hooks/useCart';
import { useCompare } from '../hooks/useCompare';
import { useWishlistToggle } from '../hooks/useWishlistToggle';
import {
  Container,
  TopRow,
  BackLink,
  Layout,
  ProductImage,
  Info,
  CompanyText,
  ProductTitle,
  ScoreRow,
  Chip,
  ButtonRow,
  Section,
  SectionTitle,
  NutritionTable,
  Materials,
  MaterialTable,
  AdditiveTag,
  Muted,
} from './styles/ProductDetailPage.styles';

// 건강 점수 색 (비교 결과 화면과 같은 기준)
const scoreColor = (score) => {
  if (score >= 70) return '#16a34a';
  if (score >= 40) return '#f59e0b';
  return '#dc2626';
};

const NUTRITION_ROWS = [
  { key: 'calories', label: '열량', unit: 'kcal' },
  { key: 'carbohydrate', label: '탄수화물', unit: 'g' },
  { key: 'sugars', label: '당류', unit: 'g' },
  { key: 'protein', label: '단백질', unit: 'g' },
  { key: 'fat', label: '지방', unit: 'g' },
  { key: 'saturatedFat', label: '포화지방', unit: 'g' },
  { key: 'transFat', label: '트랜스지방', unit: 'g' },
  { key: 'cholesterol', label: '콜레스테롤', unit: 'mg' },
  { key: 'sodium', label: '나트륨', unit: 'mg' },
];

function ProductDetailPage() {
  const { reportNo } = useParams();
  const navigate = useNavigate();
  const { isInWishlist } = useCart();
  const { addToCompare, isInCompare } = useCompare();
  const toggleWishlist = useWishlistToggle();
  const [state, setState] = useState({ status: 'loading', data: null });
  const [isSimilarOpen, setIsSimilarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', data: null });
    foodApi.detail(reportNo)
      .then(data => {
        if (cancelled) return;
        setState({ status: 'ready', data });
        // 상세 페이지를 본 기록은 행동 로그(조회 1점)로 남긴다
        logInteraction({ itemType: 'product', itemId: reportNo, action: 'view' });
      })
      .catch(err => { if (!cancelled) setState({ status: 'error', data: null, message: err.message }); });
    return () => { cancelled = true; };
  }, [reportNo]);

  if (state.status === 'loading') {
    return <MainContainer><Container><Muted>상품 정보를 불러오는 중입니다...</Muted></Container></MainContainer>;
  }

  if (state.status === 'error' || !state.data) {
    return (
      <MainContainer>
        <Container>
          <Muted>{state.message || '상품 정보를 불러오지 못했습니다.'}</Muted>
          <div><Button variant="line" size="md" onClick={() => navigate(-1)}>이전 화면으로</Button></div>
        </Container>
      </MainContainer>
    );
  }

  const { product, nutrition, upfAnalysis } = state.data;
  const name = product.productName;
  const wished = isInWishlist(product.reportNo);
  const score = upfAnalysis?.healthScore ?? 0;
  const markers = upfAnalysis?.detectedMarkers ?? [];
  // 원재료는 백엔드에서 주원료 → 일반 원료 → 복합 조미 → 첨가물 순으로 정렬되어 온다
  const materialItems = state.data.materialList ?? [];

  const handleAddToCompare = () => {
    logInteraction({ itemType: 'product', itemId: product.reportNo, action: 'compare' });
    addToCompare({
      id: product.reportNo,
      reportNo: product.reportNo,
      name,
      productName: name,
      companyName: product.companyName,
      imageUrl: product.imageUrl,
      calories: nutrition.calories,
      price: 0,
    });
  };

  return (
    <MainContainer>
      <Container>
        <TopRow>
          <BackLink type="button" onClick={() => navigate(-1)}>← 이전 화면</BackLink>
        </TopRow>

        <Layout>
          <ProductImage src={product.imageUrl || '/images/div.relative.png'} alt={name} />

          <Info>
            <CompanyText>{product.companyName || '제조사 정보 없음'}</CompanyText>
            <ProductTitle>{name}</ProductTitle>

            <ScoreRow>
              <Chip $color={scoreColor(score)}>건강 점수 {score}점</Chip>
              {upfAnalysis?.novaGroup && (
                <Chip>NOVA {upfAnalysis.novaGroup} · {upfAnalysis.statusText}</Chip>
              )}
              {product.foodCategory && <Chip>{product.foodCategory}</Chip>}
            </ScoreRow>

            <ButtonRow>
              <Button
                variant={wished ? 'primary' : 'line'}
                size="md"
                onClick={() => toggleWishlist({ id: product.reportNo, name, imageUrl: product.imageUrl })}
              >
                {wished ? '❤️ 찜함' : '🤍 찜하기'}
              </Button>
              <Button
                variant={isInCompare(product.reportNo) ? 'primary' : 'line'}
                size="md"
                onClick={handleAddToCompare}
              >
                + 비교함 담기
              </Button>
              <Button variant="line" size="md" onClick={() => setIsSimilarOpen(true)}>
                🔄 유사 상품 비교
              </Button>
            </ButtonRow>

            {markers.length > 0 && (
              <Section>
                <SectionTitle>주의 성분</SectionTitle>
                <ScoreRow>
                  {markers.map(marker => <Chip key={marker}>{marker}</Chip>)}
                </ScoreRow>
              </Section>
            )}
          </Info>
        </Layout>

        <Section>
          <SectionTitle>영양 성분표</SectionTitle>
          <NutritionTable>
            <tbody>
              {NUTRITION_ROWS.map(row => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>{Number(nutrition[row.key] ?? 0).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}{row.unit}</td>
                </tr>
              ))}
            </tbody>
          </NutritionTable>
        </Section>

        <Section>
          <SectionTitle>원재료 ({materialItems.length}개)</SectionTitle>
          {materialItems.length > 0 ? (
            <MaterialTable>
              <thead>
                <tr>
                  <th>순서</th>
                  <th>원재료명</th>
                </tr>
              </thead>
              <tbody>
                {materialItems.map((item, index) => (
                  <tr key={`${index}-${item.name}`}>
                    <td>{index + 1}</td>
                    <td>
                      {item.name}
                      {item.isAdditive && <AdditiveTag>첨가물</AdditiveTag>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </MaterialTable>
          ) : (
            <Materials>원재료 정보가 없습니다.</Materials>
          )}
        </Section>
      </Container>

      <SmartCompareModal
        isOpen={isSimilarOpen}
        productId={String(product.reportNo)}
        productName={name}
        onClose={() => setIsSimilarOpen(false)}
      />
    </MainContainer>
  );
}

export default ProductDetailPage;
