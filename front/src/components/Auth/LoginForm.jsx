import { useState } from 'react';
import Button from '../Common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  FormWrapper,
  FormTitle,
  FormSubtitle,
  FormGroup,
  Label,
  Input,
  ButtonGroup,
  SwitchText,
  SwitchButton,
} from './styles/AuthForm.styles';

const API_BASE_URL = 'http://127.0.0.1:8000';

function LoginForm({ onSwitchToSignup, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // AuthContext의 login 함수
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showToast('이메일과 비밀번호를 입력해주세요.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const detail = typeof body.detail === 'string' ? body.detail : '로그인에 실패했습니다.';
        throw new Error(detail);
      }

      const data = await response.json();
      const { access_token, user } = data;

      // 1. LocalStorage 저장
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_info', JSON.stringify(user));

      // 2. Cookie 저장 (1시간)
      document.cookie = `access_token=${access_token}; path=/; max-age=3600; SameSite=Lax`;

      // 3. AuthContext 상태 업데이트 (user 객체 전달)
      login(user);

      showToast(`${user.name}님, 환영합니다!`, 'success');

      // 4. 모달 자동 닫기
      if (onClose) {
        onClose();
      }
    } catch (error) {
      if (error instanceof TypeError) {
        showToast('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.', 'error');
      } else {
        showToast(error.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <div>
        <FormTitle>로그인</FormTitle>
        <FormSubtitle>계정에 로그인하세요</FormSubtitle>
      </div>

      <FormGroup>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="example@email.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormGroup>

      <ButtonGroup>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </ButtonGroup>

      <SwitchText>
        계정이 없으신가요?{' '}
        <SwitchButton type="button" onClick={onSwitchToSignup}>
          회원가입
        </SwitchButton>
      </SwitchText>
    </FormWrapper>
  );
}

export default LoginForm;