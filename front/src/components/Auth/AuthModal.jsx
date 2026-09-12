import { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // isOpen이 true가 되거나 defaultTab이 바뀔 때 탭 동기화
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const handleSwitchToLogin = () => {
    setActiveTab('login');
  };

  const handleSwitchToSignup = () => {
    setActiveTab('signup');
  };

  const handleClose = () => {
    setActiveTab('login');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {activeTab === 'login' ? (
        <LoginForm onSwitchToSignup={handleSwitchToSignup} />
      ) : (
        <SignupForm onSwitchToLogin={handleSwitchToLogin} />
      )}
    </Modal>
  );
}

export default AuthModal;