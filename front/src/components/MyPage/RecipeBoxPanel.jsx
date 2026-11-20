import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import Button from '../Common/Button';
import { MarkdownBody } from '../Chatbot/styles/Chatbot.styles';
import { useToast } from '../../hooks/useToast';
import { mypageApi } from '../../api/mypageApi';
import {
  ComparisonCard,
  ComparisonCardHeader,
  ComparisonDate,
  ComparisonList,
  EmptyState,
  Panel,
} from '../../pages/styles/MyPage.styles';
import { RecipeDetails, RecipeQuestion } from './styles/RecipeBoxPanel.styles';

const formatDateTime = (value) =>
  new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// 마이페이지 레시피 보관함: 챗봇 답변에서 저장한 레시피(mypage_logs, log_type = 'recipe') 목록
function RecipeBoxPanel() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    mypageApi.listRecipes()
      .then(data => {
        if (!cancelled) setLogs(data);
      })
      .catch(err => {
        if (!cancelled) showToast(err.message, 'error');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [showToast]);

  const handleRemove = async (log) => {
    if (!window.confirm(`"${log.title}" 레시피를 보관함에서 삭제할까요?`)) return;
    try {
      await mypageApi.removeLog(log.id);
      setLogs(prev => prev.filter(item => item.id !== log.id));
      showToast('보관함에서 삭제했습니다.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (isLoading) {
    return (
      <EmptyState>
        <span>레시피 보관함을 불러오는 중입니다...</span>
      </EmptyState>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState>
        <span>저장한 레시피가 없습니다. 챗봇 답변 하단의 &lsquo;이 레시피 저장하기&rsquo;를 눌러 보관해 보세요.</span>
        <Button variant="primary" size="md" onClick={() => navigate('/ai-chat')}>
          AI 챗봇으로 이동
        </Button>
      </EmptyState>
    );
  }

  return (
    <Panel>
      <ComparisonList>
        {logs.map(log => (
          <ComparisonCard key={log.id}>
            <ComparisonCardHeader>
              <ComparisonDate dateTime={log.created_at}>
                {formatDateTime(log.created_at)}
              </ComparisonDate>
              <Button variant="gray" size="sm" onClick={() => handleRemove(log)}>
                삭제
              </Button>
            </ComparisonCardHeader>
            <strong>{log.title}</strong>
            {log.content?.question && (
              <RecipeQuestion>질문: {log.content.question}</RecipeQuestion>
            )}
            <RecipeDetails>
              <summary>레시피 보기</summary>
              <MarkdownBody>
                <ReactMarkdown>{log.content?.markdown ?? ''}</ReactMarkdown>
              </MarkdownBody>
            </RecipeDetails>
          </ComparisonCard>
        ))}
      </ComparisonList>
    </Panel>
  );
}

export default RecipeBoxPanel;
