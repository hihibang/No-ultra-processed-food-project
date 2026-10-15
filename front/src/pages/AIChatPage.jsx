import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MainContainer from '../components/Layout/MainContainer';

const ChatWrapper = styled.div`
  padding: 2rem;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 12px;
  margin: 2rem 0;
`;

const ChatTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const ChatDescription = styled.p`
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
`;

const ComingSoonBadge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  padding: 0.75rem 2rem;
  background: white;
  color: #10b981;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

function AIChatPage() {
  const navigate = useNavigate();

  return (
    <MainContainer>
      <ChatWrapper>
        <ChatTitle>🤖 AI 맞춤형 레시피 챗봇</ChatTitle>
        <ChatDescription>
          당신의 주방 환경, 선호도, 그리고 식재료를 분석하여
          <br />
          맞춤형 레시피를 AI가 추천해드립니다.
        </ChatDescription>
        <ComingSoonBadge>🎉 곧 출시 예정입니다!</ComingSoonBadge>
        <BackButton onClick={() => navigate('/')}>
          홈으로 돌아가기
        </BackButton>
      </ChatWrapper>
    </MainContainer>
  );
}

export default AIChatPage;
