import React from 'react';
import { X, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'info' | 'warning';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, type = 'info' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}>
        <div className={`flex justify-between items-center p-4 border-b ${type === 'warning' ? 'bg-red-50' : 'bg-blue-50'}`}>
          <div className="flex items-center gap-2">
            <Info className={`w-5 h-5 ${type === 'warning' ? 'text-red-600' : 'text-blue-600'}`} />
            <h3 className={`font-bold text-lg ${type === 'warning' ? 'text-red-800' : 'text-blue-800'}`}>{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto text-gray-700 leading-relaxed space-y-4">
          {children}
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
