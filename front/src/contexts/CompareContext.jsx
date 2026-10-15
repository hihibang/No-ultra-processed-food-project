import { createContext, useCallback, useState } from 'react';

export const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ productName: '', count: 0 });

  const addToCompare = useCallback((product) => {
    setCompareItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev;
      }
      return [...prev, { ...product }];
    });

    setToastData({
      productName: product.name || product.title || '상품',
      count: compareItems.length + 1
    });
    setShowToast(true);
  }, [compareItems.length]);

  const removeFromCompare = useCallback((productId) => {
    setCompareItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  const isInCompare = useCallback((productId) => {
    return compareItems.some(item => item.id === productId);
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
    setShowToast,
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}
