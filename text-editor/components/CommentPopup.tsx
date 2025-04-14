import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

type CommentPopupProps = {
  position: { x: number; y: number };
  onClose: () => void;
  onSave: (text: string) => void;
  onDelete: () => void;
  initialComment?: string;
  isEditing?: boolean;
  selectedText?: string;
};

const CommentPopup = ({
  position,
  onClose,
  onSave,
  onDelete,
  initialComment = '',
  isEditing = false,
  selectedText = ''
}: CommentPopupProps) => {
  const [comment, setComment] = useState(initialComment);
  const [popupPosition, setPopupPosition] = useState(position);

  // Update position when it changes
  useEffect(() => {
    setPopupPosition(position);
  }, [position]);

  const handleSave = () => {
    if (comment.trim()) {
      onSave(comment);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-80"
      style={{
        left: `${popupPosition.x}px`,
        top: `${popupPosition.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-sm">{isEditing ? 'Edit Comment' : 'Add Comment'}</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {selectedText && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 font-medium">Selected Text:</p>
          <p className="text-xs mt-1 line-clamp-2">{selectedText}</p>
        </div>
      )}
      
      <div className="p-3">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter your comment..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          rows={3}
          autoFocus
        />
      </div>
      
      <div className="p-3 border-t border-gray-200 flex justify-end gap-2">
        {isEditing && (
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
          >
            Delete
          </button>
        )}
        <button
          onClick={handleSave}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {isEditing ? 'Update' : 'Add'}
        </button>
      </div>
    </motion.div>
  );
};

export default CommentPopup; 