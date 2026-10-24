import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainContainer from '../components/Layout/MainContainer';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';
import { useAuth } from '../hooks/useAuth';
import { Container, Card } from './styles/LoginPage.styles';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState('login');

  // 위시리스트 등에서 전달된 원래 경로로 돌아감 (없으면 홈)
  const from = location.state?.from || '/';

  // 로그인이 완료되면(이미 로그인 상태 포함) 원래 페이지로 이동
  useEffect(() => {
    if (isLoggedIn) {
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, from, navigate]);

  return (
    <MainContainer>
      <Container>
        <Card>
          {tab === 'login' ? (
            <LoginForm
              onSwitchToSignup={() => setTab('signup')}
              onClose={() => navigate(from, { replace: true })}
            />
          ) : (
            <SignupForm
              onSwitchToLogin={() => setTab('login')}
              onClose={() => navigate(from, { replace: true })}
            />
          )}
        </Card>
      </Container>
    </MainContainer>
  );
}

export default LoginPage;
