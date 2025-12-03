import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal.jsx';
import RegisterModal from '../components/RegisterModal.jsx';

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeAll = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    // Clear location state so modals don't auto-open again on back/forward
    if (location.state && (location.state.openLogin || location.state.openRegister)) {
      const { openLogin, openRegister, ...rest } = location.state;
      navigate(location.pathname, { replace: true, state: rest });
    }
  };

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  // Auto-open login modal when ProtectedRoute redirects with state
  useEffect(() => {
    if (location.state?.openLogin) {
      setIsLoginOpen(true);
      setIsRegisterOpen(false);
    }
    if (location.state?.openRegister) {
      setIsRegisterOpen(true);
      setIsLoginOpen(false);
    }
  }, [location.state]);

  const value = {
    isLoginOpen,
    isRegisterOpen,
    openLogin,
    openRegister,
    closeAll,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {isLoginOpen && <LoginModal onClose={closeAll} />}
      {isRegisterOpen && <RegisterModal onClose={closeAll} />}
    </AuthModalContext.Provider>
  );
}

export function useAuthModals() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModals must be used within an AuthModalProvider');
  }
  return ctx;
}


