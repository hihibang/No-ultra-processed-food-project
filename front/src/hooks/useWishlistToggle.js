import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { useCart } from './useCart';
import { useToast } from './useToast';

// 하트 버튼 공통 동작: 비로그인 시 로그인 안내, 로그인 시 서버 저장/삭제 후 토스트 표시
export function useWishlistToggle() {
  const { isLoggedIn } = useAuth();
  const { toggleWishlist } = useCart();
  const { showToast } = useToast();

  return useCallback(async (product) => {
    if (!isLoggedIn) {
      showToast('로그인 후 위시리스트에 담을 수 있어요.', 'error');
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
      showToast(error.message, 'error');
    }
  }, [isLoggedIn, toggleWishlist, showToast]);
}
