import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash } from 'lucide-react';

interface PageManagerProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddPage: () => void;
  onRemovePage: (page: number) => void;
}

const PageManager: React.FC<PageManagerProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onAddPage,
  onRemovePage,
}) => {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-secondary"
      >
        <ChevronLeft size={20} />
      </button>
      <div className="flex items-center space-x-4">
        <span className="text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={onAddPage} className="btn-primary">
          <Plus size={20} />
        </button>
        <button
          onClick={() => onRemovePage(currentPage)}
          disabled={totalPages === 1}
          className="btn-danger"
        >
          <Trash size={20} />
        </button>
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-secondary"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default PageManager;