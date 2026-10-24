import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainContainer from '../components/Layout/MainContainer';
import Button from '../components/Common/Button';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { comparisonApi } from '../api/comparisonApi';
import ComparisonResultModal from './Comparison/ComparisonResultModal';
import {
  APPLIANCE_OPTIONS,
  PREFERENCE_OPTIONS,
  COOKING_LEVEL_OPTIONS,
} from '../constants/userOptions';
import {
  FormGroup,
  Label,
  Input,
  ChipSection,
  ChipGroup,
  Chip,
  ErrorText,
} from '../components/Auth/styles/AuthForm.styles';
import {
  Container,
  Title,
  ProfileCard,
  ProfileHeader,
  ProfileName,
  ProfileEmail,
  SummaryRow,
  SummaryTag,
  TabBar,
  TabButton,
  Panel,
  ActionRow,
  WishlistHeader,
  WishlistGrid,
  WishlistItem,
  ItemImage,
  ItemBody,
  ItemBrand,
  ItemName,
  ItemActions,
  EmptyState,
  GuestNotice,
  ComparisonList,
  ComparisonCard,
  ComparisonCardHeader,
  ComparisonDate,
  ComparisonFoods,
  ComparisonFood,
  FoodThumb,
  FoodName,
  MissingNote,
} from './styles/MyPage.styles';

const API_BASE_URL = 'http://127.0.0.1:8000';
const SUMMARY_LIMIT = 3;
const TABS = [
  { key: 'profile', label: '개인화 설정' },
  { key: 'wishlist', label: '위시리스트 관리' },
  { key: 'comparisons', label: '비교 히스토리' },
];

const LEVEL_LABEL = Object.fromEntries(COOKING_LEVEL_OPTIONS.map(opt => [opt.value, opt.label]));

// 서버 응답 기반 프로필 폼 초기값
const toFormState = (user) => ({
  name: user?.name ?? '',
  appliances: user?.appliances ?? [],
  preferences: user?.preferences ?? [],
  cooking_level: user?.cooking_level ?? 'beginner',
});

const formatDateTime = (value) =>
  new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// 칩 요약: 일부만 보여주고 나머지는 "외 n개"로 표시
function SummaryTags({ items, emptyText }) {
  if (!items || items.length === 0) {
    return <SummaryTag>{emptyText}</SummaryTag>;
  }
  const visible = items.slice(0, SUMMARY_LIMIT);
  const rest = items.length - visible.length;
  return (
    <>
      {visible.map(item => <SummaryTag key={item}>{item}</SummaryTag>)}
      {rest > 0 && <SummaryTag>외 {rest}개</SummaryTag>}
    </>
  );
}

function MyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoggedIn, updateUser, logout } = useAuth();
  const { wishlist, removeFromWishlist, clearWishlist } = useCart();
  const { showToast } = useToast();

  const activeTab = TABS.some(t => t.key === searchParams.get('tab')) ? searchParams.get('tab') : 'profile';

  // 저장된 프로필 기준값과 편집 중인 폼 값을 분리해 변경 여부를 판단
  const [savedProfile, setSavedProfile] = useState(() => toFormState(user));
  const [form, setForm] = useState(() => toFormState(user));
  const [nameError, setNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [comparisonLogs, setComparisonLogs] = useState([]);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState(null);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedProfile),
    [form, savedProfile]
  );

  // 마운트 시 서버 최신 정보 조회 (실패 시 LocalStorage 값 유지)
  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const fetchMe = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) {
          logout();
          showToast('로그인이 만료되었습니다. 다시 로그인해 주세요.', 'error');
          return;
        }
        if (!response.ok) return;
        const latest = await response.json();
        updateUser(latest);
        setSavedProfile(toFormState(latest));
        setForm(toFormState(latest));
      } catch (error) {
        // 서버 연결 실패 시 기존 user 값으로 계속 사용
      }
    };

    fetchMe();
    // 로그인 상태가 바뀔 때만 다시 조회
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // 비교 히스토리 탭을 열 때마다 서버에서 최신 기록 조회
  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'comparisons') return;
    setIsComparisonLoading(true);
    comparisonApi.list()
      .then(setComparisonLogs)
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => setIsComparisonLoading(false));
  }, [isLoggedIn, activeTab, showToast]);

  const handleTabChange = (key) => {
    setSearchParams({ tab: key });
  };

  const handleNameChange = (e) => {
    setForm(prev => ({ ...prev, name: e.target.value }));
    if (nameError) setNameError('');
  };

  const toggleChip = (field, option) => {
    setForm(prev => {
      const current = prev[field];
      const next = current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option];
      return { ...prev, [field]: next };
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setNameError('이름을 입력해주세요.');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      showToast('로그인 정보가 없습니다. 다시 로그인해 주세요.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          appliances: form.appliances,
          preferences: form.preferences,
          cooking_level: form.cooking_level,
        }),
      });

      if (response.status === 401) {
        logout();
        showToast('로그인이 만료되었습니다. 다시 로그인해 주세요.', 'error');
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const detail = typeof body.detail === 'string' ? body.detail : '개인 정보 저장에 실패했습니다.';
        throw new Error(detail);
      }

      const latest = await response.json();
      updateUser(latest);
      setSavedProfile(toFormState(latest));
      setForm(toFormState(latest));
      showToast('개인 정보가 저장되었습니다.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setForm(savedProfile);
    setNameError('');
  };

  const handleRemoveItem = async (item) => {
    try {
      await removeFromWishlist(item.id);
      showToast(`${item.name}이(가) 위시리스트에서 제거되었습니다.`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('위시리스트를 모두 비울까요?')) return;
    try {
      await clearWishlist();
      showToast('위시리스트를 모두 비웠습니다.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  if (!isLoggedIn) {
    return (
      <MainContainer>
        <Container>
          <GuestNotice>
            <span>마이페이지는 로그인 후 이용할 수 있습니다.</span>
            <Button variant="primary" size="md" onClick={() => navigate('/')}>
              홈으로 이동
            </Button>
          </GuestNotice>
        </Container>
      </MainContainer>
    );
  }

  const renderProfileTab = () => (
    <Panel>
      <FormGroup>
        <Label htmlFor="mypage-name">이름</Label>
        <Input
          id="mypage-name"
          type="text"
          placeholder="이름을 입력하세요"
          value={form.name}
          onChange={handleNameChange}
          disabled={isSaving}
        />
        {nameError && <ErrorText>{nameError}</ErrorText>}
      </FormGroup>

      <ChipSection>
        <Label>보유 주방기기</Label>
        <ChipGroup>
          {APPLIANCE_OPTIONS.map(option => (
            <Chip
              key={option}
              type="button"
              $active={form.appliances.includes(option)}
              onClick={() => toggleChip('appliances', option)}
              disabled={isSaving}
            >
              {option}
            </Chip>
          ))}
        </ChipGroup>
      </ChipSection>

      <ChipSection>
        <Label>선호 요리 스타일</Label>
        <ChipGroup>
          {PREFERENCE_OPTIONS.map(option => (
            <Chip
              key={option}
              type="button"
              $active={form.preferences.includes(option)}
              onClick={() => toggleChip('preferences', option)}
              disabled={isSaving}
            >
              {option}
            </Chip>
          ))}
        </ChipGroup>
      </ChipSection>

      <ChipSection>
        <Label>요리 숙련도</Label>
        <ChipGroup>
          {COOKING_LEVEL_OPTIONS.map(option => (
            <Chip
              key={option.value}
              type="button"
              $active={form.cooking_level === option.value}
              onClick={() => setForm(prev => ({ ...prev, cooking_level: option.value }))}
              disabled={isSaving}
            >
              {option.label}
            </Chip>
          ))}
        </ChipGroup>
      </ChipSection>

      <ActionRow>
        <Button variant="gray" size="md" onClick={handleReset} disabled={!isDirty || isSaving}>
          되돌리기
        </Button>
        <Button variant="primary" size="md" onClick={handleSave} disabled={!isDirty || isSaving}>
          {isSaving ? '저장 중...' : '저장하기'}
        </Button>
      </ActionRow>
    </Panel>
  );

  const renderComparisonTab = () => {
    if (isComparisonLoading) {
      return (
        <EmptyState>
          <span>비교 기록을 불러오는 중입니다...</span>
        </EmptyState>
      );
    }

    if (comparisonLogs.length === 0) {
      return (
        <EmptyState>
          <span>저장된 비교 기록이 없습니다. 비교함에서 상품을 비교해 보세요.</span>
          <Button variant="primary" size="md" onClick={() => navigate('/compare')}>
            비교함으로 이동
          </Button>
        </EmptyState>
      );
    }

    return (
      <Panel>
        <ComparisonList>
          {comparisonLogs.map(log => {
            const missingCount = log.product_ids.length - log.foods.length;
            return (
              <ComparisonCard key={log.comparison_id}>
                <ComparisonCardHeader>
                  <ComparisonDate dateTime={log.created_at}>
                    {formatDateTime(log.created_at)}
                  </ComparisonDate>
                  <Button
                    variant="line"
                    size="sm"
                    onClick={() => setSelectedComparison({
                      id: log.comparison_id,
                      createdAtLabel: formatDateTime(log.created_at),
                    })}
                  >
                    결과 다시보기
                  </Button>
                </ComparisonCardHeader>
                <ComparisonFoods>
                  {log.foods.map(food => (
                    <ComparisonFood key={food.reportNo}>
                      <FoodThumb
                        src={food.imageUrl ?? '/images/div.relative.png'}
                        alt={food.productName}
                      />
                      <FoodName title={food.productName}>{food.productName}</FoodName>
                    </ComparisonFood>
                  ))}
                  {missingCount > 0 && (
                    <MissingNote>삭제된 상품 {missingCount}개</MissingNote>
                  )}
                </ComparisonFoods>
              </ComparisonCard>
            );
          })}
        </ComparisonList>
        <ComparisonResultModal
          isOpen={selectedComparison !== null}
          onClose={() => setSelectedComparison(null)}
          comparisonId={selectedComparison?.id}
          createdAtLabel={selectedComparison?.createdAtLabel}
        />
      </Panel>
    );
  };

  const renderWishlistTab = () => {
    if (wishlist.length === 0) {
      return (
        <EmptyState>
          <span>찜한 상품이 없습니다. 카탈로그에서 상품을 찜해 보세요.</span>
          <Button variant="primary" size="md" onClick={() => navigate('/catalog')}>
            카탈로그로 이동
          </Button>
        </EmptyState>
      );
    }

    return (
      <Panel>
        <WishlistHeader>
          <span>총 {wishlist.length}개</span>
          <Button variant="line" size="sm" onClick={handleClearAll}>
            전체 삭제
          </Button>
        </WishlistHeader>

        <WishlistGrid>
          {wishlist.map(item => {
            const price = Number(item.price ?? 0);
            return (
              <WishlistItem key={item.id}>
                <ItemImage
                  src={item.image ?? item.imageUrl ?? '/images/div.relative.png'}
                  alt={item.name}
                />
                <ItemBody>
                  {(item.brand || item.company || item.companyName) && (
                    <ItemBrand>{item.brand ?? item.company ?? item.companyName}</ItemBrand>
                  )}
                  <ItemName>{item.name}</ItemName>
                </ItemBody>
                <ItemActions>
                  <Button variant="gray" size="sm" style={{ width: '100%' }} onClick={() => handleRemoveItem(item)}>
                    삭제
                  </Button>
                </ItemActions>
              </WishlistItem>
            );
          })}
        </WishlistGrid>
      </Panel>
    );
  };

  return (
    <MainContainer>
      <Container>
        <Title>마이페이지</Title>

        <ProfileCard>
          <ProfileHeader>
            <ProfileName>{savedProfile.name || '사용자'}</ProfileName>
            {user?.email && <ProfileEmail>{user.email}</ProfileEmail>}
          </ProfileHeader>
          <SummaryRow>
            <span>요리 숙련도:</span>
            <SummaryTag>{LEVEL_LABEL[savedProfile.cooking_level] ?? '초보'}</SummaryTag>
          </SummaryRow>
          <SummaryRow>
            <span>주방기기:</span>
            <SummaryTags items={savedProfile.appliances} emptyText="등록된 기기 없음" />
          </SummaryRow>
          <SummaryRow>
            <span>선호 요리:</span>
            <SummaryTags items={savedProfile.preferences} emptyText="등록된 취향 없음" />
          </SummaryRow>
        </ProfileCard>

        <TabBar role="tablist">
          {TABS.map(tab => (
            <TabButton
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              $active={activeTab === tab.key}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
              {tab.key === 'wishlist' && wishlist.length > 0 ? ` (${wishlist.length})` : ''}
            </TabButton>
          ))}
        </TabBar>

        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'wishlist' && renderWishlistTab()}
        {activeTab === 'comparisons' && renderComparisonTab()}
      </Container>
    </MainContainer>
  );
}

export default MyPage;
