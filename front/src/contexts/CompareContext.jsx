import { createContext, useCallback, useEffect, useState } from 'react';
import { comparisonApi } from '../api/comparisonApi';
import { getProductId } from '../utils/product';

export const CompareContext = createContext();

const STORAGE_KEY = 'compare_items';

const readStoredItems = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    return [];
  }
};

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState(readStoredItems);
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ productName: '', count: 0 });

  // 비교함 상태는 새로고침 후에도 유지되도록 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = useCallback((product) => {
    const id = getProductId(product);
    setCompareItems(prev => {
      const exists = prev.find(item => item.id === id);
      if (exists) {
        return prev;
      }
      return [...prev, { ...product, id }];
    });

    setToastData({
      productName: product.name || product.productName || product.title || '상품',
      count: compareItems.length + 1
    });
    setShowToast(true);
  }, [compareItems.length]);

  const removeFromCompare = useCallback((productId) => {
    const id = String(productId);
    setCompareItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  const isInCompare = useCallback((productId) => {
    return compareItems.some(item => item.id === String(productId));
  }, [compareItems]);

  // 현재 비교함 내용을 비교 로그로 서버에 저장 (로그인 필요)
  const runCompare = useCallback(async () => {
    const productIds = compareItems.map(item => item.id);
    return comparisonApi.create(productIds);
  }, [compareItems]);

  const compareCount = compareItems.length;

  const value = {
    compareItems,
    compareCount,
    showToast,
    toastData,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    runCompare,
    setShowToast,
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}
