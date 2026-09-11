import { useState } from 'react';
import styled from 'styled-components';
import { flexCenter, flexBetween } from '../../styles/mixins';

const SearchContainer = styled.div`
  flex: 1;
  max-width: 580px;
`;

const SearchBoxWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  padding: 0.25rem 0.5rem 0.25rem 1rem;
  background-color: ${({ theme }) => theme.colors.white};
`;

const SearchInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textMain};
  background: transparent;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const SearchButton = styled.button`
  ${flexCenter}
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 1.1rem;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const SearchHints = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.35rem;
  padding-left: 0.5rem;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSub};
`;

const HintLabel = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const HintTag = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSub};
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  font-family: inherit;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

function SearchBox({ onSearch, hints = [], placeholder = '검색어를 입력하세요' }) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch?.(searchValue);
      setSearchValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleHintClick = (hint) => {
    setSearchValue(hint);
    onSearch?.(hint);
  };

  return (
    <SearchContainer>
      <SearchBoxWrapper>
        <SearchInput
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SearchButton onClick={handleSearch}>🔍</SearchButton>
      </SearchBoxWrapper>
      {hints.length > 0 && (
        <SearchHints>
          <HintLabel>인기 성분:</HintLabel>
          {hints.map((hint, index) => (
            <HintTag key={index} onClick={() => handleHintClick(hint)}>
              {hint}
            </HintTag>
          ))}
        </SearchHints>
      )}
    </SearchContainer>
  );
}

export default SearchBox;
