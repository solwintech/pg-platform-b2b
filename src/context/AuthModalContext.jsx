import React, { createContext, useContext, useState } from 'react';

const AuthModalContext = createContext();

export const useAuthModal = () => useContext(AuthModalContext);

export const AuthModalProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [onSuccessCallback, setOnSuccessCallback] = useState(null);
  const [initialMode, setInitialMode] = useState('login'); // 'login' or 'signup'

  const openAuthModal = (callback = null, mode = 'login') => {
    if (callback) {
      setOnSuccessCallback(() => callback);
    } else {
      setOnSuccessCallback(null);
    }
    setInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setOnSuccessCallback(null);
  };

  return (
    <AuthModalContext.Provider value={{
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      onSuccessCallback,
      initialMode
    }}>
      {children}
    </AuthModalContext.Provider>
  );
};
