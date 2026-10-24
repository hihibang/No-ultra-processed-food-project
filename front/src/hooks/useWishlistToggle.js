import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useCart } from './useCart';
import { useToast } from './useToast';

// 하트 버튼 공통 동작: 비로그인 시 로그인 페이지로 이동, 로그인 시 서버 저장/삭제 후 토스트 표시
export function useWishlistToggle() {
  const { isLoggedIn } = useAuth();
  const { toggleWishlist } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 후 원래 보던 페이지로 돌아오도록 현재 경로를 state로 전달
  const goToLogin = useCallback(() => {
    showToast('로그인 후 위시리스트에 담을 수 있어요. 로그인 페이지로 이동합니다.', 'error');
    navigate('/login', {
      state: { from: `${location.pathname}${location.search}` },
    });
  }, [showToast, navigate, location]);

  return useCallback(async (product) => {
    if (!isLoggedIn) {
      goToLogin();
      return;
    }

    const name = product.name ?? product.productName ?? '상품';
    try {
      const result = await toggleWishlist(product);
      if (result === 'exists') {
        showToast(`${name}은(는) 이미 위시리스트에 있습니다.`, 'info');
      } else if (result === 'added') {
        showToast(`${name}이(가) 위시리스트에 추가되었습니다.`, 'success');
      } else {
        showToast(`${name}이(가) 위시리스트에서 제거되었습니다.`, 'success');
      }
    } catch (error) {
      // 토큰 만료(401)는 세션이 끊긴 것이므로 로그인 페이지로 안내
      if (error.status === 401) {
        goToLogin();
        return;
      }
      showToast(error.message, 'error');
    }
  }, [isLoggedIn, toggleWishlist, showToast, goToLogin]);
}
