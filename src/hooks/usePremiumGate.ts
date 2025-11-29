import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const usePremiumGate = () => {
  const { user } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);

  const checkAccess = (feature?: string): boolean => {
    if (user?.isPro) return true;
    setModalOpen(true);
    return false;
  };

  return {
    isPremium: !!user?.isPro,
    checkAccess,
    isModalOpen,
    closeModal: () => setModalOpen(false)
  };
};