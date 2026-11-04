import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainContainer from '../components/Layout/MainContainer';
import Button from '../components/Common/Button';
import { useAuth } from '../hooks/useAuth';
import { useCompare } from '../hooks/useCompare';
import { useToast } from '../hooks/useToast';
import ComparisonResultModal from './Comparison/ComparisonResultModal';
import {
  Container,
  Header,
  Title,
  Subtitle,
  EmptyState,
  TableWrapper,
  CompareTable,
  Th,
  Td,
  RowLabel,
  ItemImage,
  ItemName,
  ActionRow,
  Hint,
  ButtonGroup,
} from './styles/ComparePage.styles';

const MIN_COMPARE_COUNT = 2;

const ROWS = [
  { key: 'company', label: '제조사', getValue: (item) => item.companyName ?? item.company ?? '정보 없음' },
  { key: 'category', label: '식품 유형', getValue: (item) => item.foodCategory ?? item.category ?? '정보 없음' },
  {
    key: 'calories',
    label: '칼로리',
    getValue: (item) => (item.calories != null ? `${item.calories} kcal` : '정보 없음'),
  },
];

function ComparePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { compareItems, removeFromCompare, clearCompare, runCompare } = useCompare();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  // 비교 실행 응답(리포트 포함)을 보관하고, 같은 자리에서 결과 모달을 연다
  const [savedResult, setSavedResult] = useState(null);

  const canCompare = compareItems.length >= MIN_COMPARE_COUNT;

  const handleRunCompare = async () => {
    if (!isLoggedIn) {
      showToast('로그인 후 비교 기록을 저장할 수 있어요.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const result = await runCompare();
      setSavedResult(result);
      // 비교 저장 성공 후 비교함 비우기 (결과 모달은 savedResult로 열려 있음)
      clearCompare();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = (item) => {
    removeFromCompare(item.id);
    showToast(`${item.name ?? item.productName}이(가) 비교함에서 제거되었습니다.`, 'success');
  };

  const handleClearAll = () => {
    if (!window.confirm('비교함을 모두 비울까요?')) return;
    clearCompare();
    showToast('비교함을 모두 비웠습니다.', 'success');
  };

  // 결과 모달은 비교함 상태(compareItems)와 무관하게 savedResult로만 열리도록
  // 빈 상태/일반 화면 양쪽에서 렌더링한다 (비교 실행 후 비교함이 비워져도 모달 유지)
  const resultModal = (
    <ComparisonResultModal
      isOpen={savedResult !== null}
      onClose={() => setSavedResult(null)}
      data={savedResult}
      createdAtLabel={
        savedResult?.created_at
          ? new Date(savedResult.created_at).toLocaleString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : undefined
      }
    />
  );

  if (compareItems.length === 0) {
    return (
      <MainContainer>
        <Container>
          <Header>
            <Title>비교함</Title>
          </Header>
          <EmptyState>
            <span>비교함이 비어 있습니다. 카탈로그에서 상품을 담아 보세요.</span>
            <Button variant="primary" size="md" onClick={() => navigate('/catalog')}>
              카탈로그로 이동
            </Button>
          </EmptyState>
        </Container>
        {resultModal}
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Container>
        <Header>
          <Title>비교함</Title>
          <Subtitle>총 {compareItems.length}개 상품</Subtitle>
        </Header>

        <TableWrapper>
          <CompareTable>
            <thead>
              <tr>
                <Th scope="col" />
                {compareItems.map((item) => (
                  <Th key={item.id} scope="col">
                    <ItemImage
                      src={item.imageUrl ?? item.image ?? '/images/div.relative.png'}
                      alt={item.name ?? item.productName}
                    />
                    <ItemName>{item.name ?? item.productName}</ItemName>
                    <Button variant="gray" size="sm" onClick={() => handleRemove(item)}>
                      삭제
                    </Button>
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <RowLabel>{row.label}</RowLabel>
                  {compareItems.map((item) => (
                    <Td key={item.id}>{row.getValue(item)}</Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </CompareTable>
        </TableWrapper>

        <ActionRow>
          <Hint>
            {canCompare
              ? '비교 실행을 누르면 이 조합이 비교 히스토리에 저장됩니다.'
              : `${MIN_COMPARE_COUNT}개 이상 담아야 비교할 수 있습니다.`}
          </Hint>
          <ButtonGroup>
            <Button variant="line" size="md" onClick={handleClearAll} disabled={isSaving}>
              전체 비우기
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleRunCompare}
              disabled={!canCompare || isSaving}
            >
              {isSaving ? '저장 중...' : '비교 실행'}
            </Button>
          </ButtonGroup>
        </ActionRow>

      </Container>
      {resultModal}
    </MainContainer>
  );
}

export default ComparePage;
