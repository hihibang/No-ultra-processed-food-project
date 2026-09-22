import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JournalCard from './JournalCard';
import JournalDetailModal from './JournalDetailModal';
import { journalMockData } from '../../data/journalMockData';
import { SectionContainer, Header, Title, ViewAllButton, CardsGrid } from './FoodJournalSection.styles';

function FoodJournalSection() {
  const navigate = useNavigate();
  const [selectedStory, setSelectedStory] = useState(null);

  const latestStories = journalMockData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  const handleViewAll = () => {
    navigate('/journal');
  };

  const handleCardClick = (story) => {
    setSelectedStory(story);
  };

  const handleCloseModal = () => {
    setSelectedStory(null);
  };

  return (
    <>
      <SectionContainer>
        <Header>
          <Title>푸드 저널 & 식단 이야기</Title>
          <ViewAllButton onClick={handleViewAll}>전체 이야기 보기 →</ViewAllButton>
        </Header>
        <CardsGrid>
          {latestStories.map((story) => (
            <JournalCard key={story.id} data={story} onClick={() => handleCardClick(story)} />
          ))}
        </CardsGrid>
      </SectionContainer>

      {selectedStory && <JournalDetailModal data={selectedStory} onClose={handleCloseModal} />}
    </>
  );
}

export default FoodJournalSection;
