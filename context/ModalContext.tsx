import React, { createContext, useState, useContext, ReactNode } from 'react';
import IntaSendModal from '../components/modals/IntaSendModal';
import EditProfileModal from '../components/modals/EditProfileModal';
import FeedbackModal from '../components/modals/FeedbackModal';
import ExportModal from '../components/modals/ExportModal';

type ModalType = 'intaSend' | 'editProfile' | 'feedback' | 'export';

interface ModalState {
  type: ModalType;
  props?: any;
}

interface ModalContextType {
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modal, setModal] = useState<ModalState | null>(null);

  const openModal = (type: ModalType, props: any = {}) => setModal({ type, props });
  const closeModal = () => setModal(null);

  const renderModal = () => {
    if (!modal) return null;
    
    switch (modal.type) {
      case 'intaSend':
        return <IntaSendModal onClose={closeModal} {...modal.props} />;
      case 'editProfile':
        return <EditProfileModal onClose={closeModal} {...modal.props} />;
      case 'feedback':
        return <FeedbackModal onClose={closeModal} {...modal.props} />;
      case 'export':
        return <ExportModal onClose={closeModal} {...modal.props} />;
      default:
        return null;
    }
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {renderModal()}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};