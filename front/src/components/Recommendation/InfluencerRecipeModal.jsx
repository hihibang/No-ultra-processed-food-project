import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { recommendationApi } from '../../api/recommendationApi';
import { ModalOverlay, ModalContent, ModalHeader, ModalTitle, CloseButton, ModalBody } from '../Common/styles/ProductDetailModal.styles';
import { MarkdownBody } from '../Chatbot/styles/Chatbot.styles';
import { MutedText } from './styles/Recommendation.styles';

// 인플루언서 검수 레시피 본문 보기 (챗봇 추천 카드와 /influencers 페이지가 함께 쓴다)
function InfluencerRecipeModal({ recipeId, fallbackTitle = '', creatorName = '', onClose }) {
  const [state, setState] = useState({ status: 'loading', markdown: '', title: fallbackTitle, creator: creatorName });

  useEffect(() => {
    if (recipeId == null) return undefined;
    let cancelled = false;
    setState({ status: 'loading', markdown: '', title: fallbackTitle, creator: creatorName });
    recommendationApi.influencerRecipeDetail(recipeId)
      .then(detail => { if (!cancelled) setState({ status: 'ready', markdown: detail.markdown, title: detail.title, creator: detail.creatorName }); })
      .catch(() => { if (!cancelled) setState(prev => ({ ...prev, status: 'error' })); });
    return () => { cancelled = true; };
  }, [recipeId, fallbackTitle, creatorName]);

  if (recipeId == null) return null;

  return createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{state.title} · {state.creator}</ModalTitle>
          <CloseButton onClick={onClose} aria-label="닫기">✕</CloseButton>
        </ModalHeader>
        <ModalBody>
          {state.status === 'loading' && <MutedText>레시피를 불러오는 중입니다...</MutedText>}
          {state.status === 'error' && <MutedText>레시피를 불러오지 못했습니다.</MutedText>}
          {state.status === 'ready' && (
            <MarkdownBody>
              <ReactMarkdown>{state.markdown}</ReactMarkdown>
            </MarkdownBody>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>,
    document.body,
  );
}

export default InfluencerRecipeModal;
