import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JournalCard from './JournalCard';
import JournalDetailModal from './JournalDetailModal';
import { journalMockData } from '../../data/journalMockData';
import { SectionContainer, HeaderSection, SectionLabel, MainTitle, ViewAllButton, CardsGrid } from './FoodJournalSection.styles';

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
        <HeaderSection>
          <div>
            <SectionLabel>🌿 푸드 저널 & 스토리</SectionLabel>
            <MainTitle>건강한 먹거리와 함께하는 일상</MainTitle>
          </div>
          <ViewAllButton onClick={handleViewAll}>전체 이야기 보기 →</ViewAllButton>
        </HeaderSection>
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
