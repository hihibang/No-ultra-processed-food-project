import { createContext, useCallback, useEffect, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 1. 앱 처음 로드 시 LocalStorage에서 유저 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
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