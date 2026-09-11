import { createContext, useCallback, useState } from 'react';

export const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const addToSearchHistory = useCallback((query) => {
    if (!query.trim()) return;

    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      return [query, ...filtered].slice(0, 10);
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const performSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    addToSearchHistory(query);

    // 실제 검색 로직 (현재는 시뮬레이션)
    setTimeout(() => {
      const mockResults = [
        { id: 1, name: '유기농 완전 밀가루', query },
        { id: 2, name: '저염 요거트', query },
        { id: 3, name: '비건 단백질 쉐이크', query },
      ].filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        query.includes('#') // 해시태그 검색 지원
      );

      setSearchResults(mockResults);
      setIsSearching(false);
    }, 300);
  }, [addToSearchHistory]);

  const value = {
    searchHistory,
    searchResults,
    isSearching,
    addToSearchHistory,
    clearSearchHistory,
    performSearch,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}
