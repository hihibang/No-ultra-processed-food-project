import { useState } from 'react';
import { getIcon } from '../../constants/icons';
import {
  SearchContainer,
  SearchBoxWrapper,
  SearchInput,
  SearchButton,
  SearchHints,
  HintLabel,
  HintTag,
} from './styles/SearchBox.styles';

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
    const cleanHint = hint.replace('#', '');
    setSearchValue(cleanHint);
    onSearch?.(cleanHint);
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
        <SearchButton onClick={handleSearch}>{getIcon('search')}</SearchButton>
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