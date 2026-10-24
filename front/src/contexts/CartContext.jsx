import { createContext, useCallback, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { wishlistApi } from '../api/wishlistApi';
import { ApiError } from '../api/http';
import { normalizeProduct, fromWishlistEntry } from '../utils/product';

export const CartContext = createContext();

// 이미 삭제된 찜(404)은 목표 상태와 같으므로 성공으로 본다
const removeOnServer = async (productId) => {
  try {
    await wishlistApi.remove(productId);
  } catch (error) {
    if (error.status !== 404) throw error;
  }
};

export function CartProvider({ children }) {
  const { user, isLoggedIn } = useAuth();
  const userId = user?.user_id;

  const [wishlist, setWishlist] = useState([]);

  // 로그인 사용자의 찜 목록을 서버에서 불러오고, 로그아웃 시 비움
  const loadWishlist = useCallback(async () => {
    const entries = await wishlistApi.list();
    setWishlist(entries.map(fromWishlistEntry));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setWishlist([]);
      return;
    }
    loadWishlist().catch((error) => console.error('찜 목록 조회 실패:', error));
  }, [isLoggedIn, userId, loadWishlist]);

  // 낙관적 업데이트 후 서버 저장, 실패 시 이전 목록으로 되돌리고 에러를 던짐
  // 반환값: 'added' | 'removed' | 'exists' (이미 서버에 찜되어 있던 경우)
  const removeFromWishlist = useCallback(async (productId) => {
    if (!isLoggedIn) throw new ApiError('로그인이 필요합니다.', 401);
    const id = String(productId);
    const snapshot = wishlist;
    setWishlist(prev => prev.filter(item => item.id !== id));
    try {
      await removeOnServer(id);
      return 'removed';
    } catch (error) {
      setWishlist(snapshot);
      throw error;
    }
  }, [isLoggedIn, wishlist]);

  const toggleWishlist = useCallback(async (product) => {
    if (!isLoggedIn) throw new ApiError('로그인이 필요합니다.', 401);
    const item = normalizeProduct(product);
    const snapshot = wishlist;

    if (snapshot.some(entry => entry.id === item.id)) {
      return removeFromWishlist(item.id);
    }

    setWishlist(prev => [...prev, item]);
    try {
      await wishlistApi.add(item.id);
      return 'added';
    } catch (error) {
      if (error.status === 409) return 'exists';
      setWishlist(snapshot);
      throw error;
    }
  }, [isLoggedIn, wishlist, removeFromWishlist]);

  const clearWishlist = useCallback(async () => {
    const snapshot = wishlist;
    setWishlist([]);
    try {
      await Promise.all(snapshot.map(item => removeOnServer(item.id)));
    } catch (error) {
      setWishlist(snapshot);
      throw error;
    }
  }, [wishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.id === String(productId));
  }, [wishlist]);

  const wishlistCount = wishlist.length;

  const value = {
    wishlist,
    wishlistCount,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
