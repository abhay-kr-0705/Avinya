import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'lg'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Add Escape key listener to close modal
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Size classes for the modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={`glass-card ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden rounded-xl shadow-2xl transform transition-all duration-300 ease-out`}
        style={{animation: 'fadeIn 0.3s ease-out, slideUp 0.3s ease-out'}}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200/30 bg-gradient-to-r from-primary-50 to-secondary-50/30">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-200/50 transition-all duration-200 text-gray-500 hover:text-primary-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-6rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
