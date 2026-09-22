import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import JournalCard from '../components/Journal/JournalCard';
import JournalDetailModal from '../components/Journal/JournalDetailModal';
import { journalMockData } from '../data/journalMockData';
import {
  Container,
  Header,
  BackButton,
  Title,
  SearchSection,
  SearchInput,
  FilterSection,
  FilterTab,
  CardsGrid,
  EmptyMessage,
} from './styles/JournalPage.styles';

function JournalPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);

  const categories = ['전체', ...new Set(journalMockData.map((item) => item.category))];

  const filteredData = useMemo(() => {
    return journalMockData.filter((item) => {
      const matchCategory = selectedCategory === '전체' || item.category === selectedCategory;
      const matchSearch =
        searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  const handleNavigateBack = () => {
    navigate(-1);
  };

  const handleCardClick = (story) => {
    setSelectedStory(story);
  };

  const handleCloseModal = () => {
    setSelectedStory(null);
  };

  return (
    <>
      <Container>
        <Header>
          <BackButton onClick={handleNavigateBack}>← 뒤로</BackButton>
          <Title>푸드 저널</Title>
        </Header>

        <SearchSection>
          <SearchInput
            type="text"
            placeholder="검색어를 입력하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchSection>

        <FilterSection>
          {categories.map((category) => (
            <FilterTab
              key={category}
              isActive={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </FilterTab>
          ))}
        </FilterSection>

        {filteredData.length > 0 ? (
          <CardsGrid>
            {filteredData.map((story) => (
              <JournalCard key={story.id} data={story} onClick={() => handleCardClick(story)} />
            ))}
          </CardsGrid>
        ) : (
          <EmptyMessage>검색 결과가 없습니다.</EmptyMessage>
        )}
      </Container>

      {selectedStory && <JournalDetailModal data={selectedStory} onClose={handleCloseModal} />}
    </>
  );
}

export default JournalPage;
