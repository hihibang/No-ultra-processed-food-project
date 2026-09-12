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

function LoginForm({ onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
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

    setTimeout(() => {
      login(formData.email.split('@')[0]);
      showToast('로그인되었습니다!', 'success');
      setIsLoading(false);
    }, 800);
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
