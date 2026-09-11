import { useState } from 'react';
import Modal from '../Common/Modal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

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
