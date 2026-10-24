import { createContext, useCallback, useEffect, useState } from 'react';
import { AUTH_EXPIRED_EVENT } from '../api/http';

export const AuthContext = createContext();

// JWT payload의 exp(초 단위)를 확인해 만료 여부 판단 (서명 검증은 서버가 수행)
const isTokenExpired = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
  } catch (e) {
    return true;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 1. 앱 처음 로드 시 토큰이 유효할 때만 LocalStorage에서 유저 정보 복원
  //    토큰이 없거나 만료되었는데 user_info만 남아 있으면 로그인 상태로 보지 않는다
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user_info');

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('유저 정보 파싱 실패:', e);
        localStorage.removeItem('user_info');
        localStorage.removeItem('access_token');
      }
    }
  }, []);

  // 2. 로그인 처리 (문자열이 들어오든 user 객체가 들어오든 안전하게 저장)
  const login = useCallback((userData) => {
    if (typeof userData === 'object' && userData !== null) {
      setUser(userData);
      localStorage.setItem('user_info', JSON.stringify(userData));
    } else if (typeof userData === 'string') {
      const simpleUser = { name: userData };
      setUser(simpleUser);
      localStorage.setItem('user_info', JSON.stringify(simpleUser));
    }
  }, []);

  // 3. 로그아웃 처리 (상태 + LocalStorage + Cookie 모두 삭제)
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }, []);

  // 서버가 401을 반환하면(토큰 만료 등) 자동 로그아웃
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout);
  }, [logout]);

  // 4. 회원가입 처리
  const signup = useCallback((userData) => {
    login(userData);
  }, [login]);

  // 5. 프로필 수정 후 user 객체 최신화 (state + LocalStorage 동시 갱신)
  const updateUser = useCallback((userData) => {
    if (typeof userData === 'object' && userData !== null) {
      setUser(userData);
      localStorage.setItem('user_info', JSON.stringify(userData));
    }
  }, []);

  // 하위 컴포넌트 편의를 위한 연산값
  const isLoggedIn = !!user;
  const userName = user?.name || (typeof user === 'string' ? user : '사용자');

  const value = {
    user,         // 유저 전체 객체 { user_id, email, name, appliances, preferences, ... }
    userName,     // 화면 표시용 이름 (문자열)
    isLoggedIn,   // 로그인 여부 (boolean)
    login,
    logout,
    signup,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}