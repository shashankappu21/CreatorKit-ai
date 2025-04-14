'use client'

import { EditorContent, Editor } from '@tiptap/react'
import { useEffect, useState, useCallback, useImperativeHandle, forwardRef, useRef } from 'react'
import CommentPopup from '../CommentPopup'
import GenerateContentPopup from '../GenerateContentPopup'
import { Check, X } from 'lucide-react'

type Comment = {
  id: string;
  text: string;
  selectedText: string;
  position: { x: number; y: number };
  nodeId: string;
  from: number;
  to: number;
};

export interface RichTextEditorRef {
  handlePreviewContent: (content: string) => void
  handleRejectContent: () => void
}

interface Props {
  editor: Editor | null
}

function RichTextEditor({ editor }: Props, ref: React.ForwardedRef<RichTextEditorRef>) {
  const [isEmpty, setIsEmpty] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeComment, setActiveComment] = useState<Comment | null>(null);
  const [commentPopupPosition, setCommentPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [highlightedComment, setHighlightedComment] = useState<Comment | null>(null);
  const [commentButtonPosition, setCommentButtonPosition] = useState<{ x: number; y: number } | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [selectedTextForAI, setSelectedTextForAI] = useState<string>('');
  const [aiPopupPosition, setAiPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [generateContentPosition, setGenerateContentPosition] = useState<{ x: number; y: number } | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [diffView, setDiffView] = useState<boolean>(false);
  const [diffContent, setDiffContent] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [originalSelection, setOriginalSelection] = useState<{ from: number; to: number } | null>(null);

  // Handle comment selection
  const handleSelectComment = useCallback((comment: Comment) => {
    if (!editor) return;
    
    // Set the highlighted comment
    setHighlightedComment(comment);
    
    // Select the text in the editor
    editor.commands.setTextSelection({ from: comment.from, to: comment.to });
    
    // Show the comment popup
    setActiveComment(comment);
    setCommentPopupPosition(comment.position);
    setSelectedText(comment.selectedText);
  }, [editor]);

  // Handle comment deletion from dropdown
  const handleDeleteCommentFromDropdown = useCallback((id: string) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
    
    // If the deleted comment was highlighted, clear the highlight
    if (highlightedComment && highlightedComment.id === id) {
      setHighlightedComment(null);
    }
  }, [highlightedComment]);

  // Handle comment button click
  const handleCommentClick = useCallback(() => {
    if (!editor) return;
    
    const { view } = editor;
    const { state } = view;
    const { selection } = state;
    
    // Get the selected text
    const text = state.doc.textBetween(selection.from, selection.to);
    
    if (!text) {
      alert('Please select some text to comment on');
      return;
    }
    
    // Create a new comment
    const newComment: Comment = {
      id: Date.now().toString(),
      text: '',
      selectedText: text,
      position: { x: 0, y: 0 }, // This will be updated by the popup
      nodeId: selection.from.toString(),
      from: selection.from,
      to: selection.to
    };
    
    setSelectedText(text);
    setActiveComment(newComment);
    
    // Always use the comment button position for the popup
    if (commentButtonPosition) {
      setCommentPopupPosition(commentButtonPosition);
    }
  }, [editor, commentButtonPosition]);

  // Handle generate content button click
  const handleGenerateContentClick = useCallback(() => {
    if (!editor) return;
    
    // Find the generate content button
    const button = document.querySelector('button[aria-label="Generate content"]');
    if (button) {
      const rect = button.getBoundingClientRect();
      setGenerateContentPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8
      });
    }
  }, [editor]);

  // Handle applying generated content
  const handleApplyGeneratedContent = useCallback((content: string) => {
    if (!editor) return;
    
    // Insert the generated content at the current cursor position
    editor.commands.insertContent(content);
    
    // Close the popup
    setGenerateContentPosition(null);
  }, [editor]);

  const handleGenerateContent = () => {
    if (!editor) return;
    
    // Get cursor position for popup placement
    const view = editor.view;
    const { top, left } = view.coordsAtPos(editor.state.selection.from);
    
    setGenerateContentPosition({
      x: left,
      y: top + window.scrollY + 24 // Add some offset from the cursor
    });
  };

  const handlePreviewContent = (content: string) => {
    if (!editor) {
      console.error('Editor is not available');
      return;
    }
    
    try {
      // Store the current content and selection for potential rejection
      const { from, to } = editor.state.selection;
      const originalText = editor.state.doc.textBetween(from, to);
      
      // Save original content and selection
      setOriginalContent(originalText);
      setOriginalSelection({ from, to });
      
      console.log('Stored original content in editor:', originalText, 'at position:', { from, to });
      
      // Insert the new content
      editor.chain()
        .focus()
        .deleteRange({ from, to })
        .insertContent(content)
        .run();
      
      // We no longer need to track the generated content position
      // since we're not applying it immediately
    } catch (error) {
      console.error('Error in handlePreviewContent:', error);
    }
  };

  const handleRejectContent = () => {
    console.log('handleRejectContent called in editor - this should not be called anymore');
  };

  // Expose the comment function to the editor
  useEffect(() => {
    if (editor) {
      // Add the comment function to the editor
      (editor as any).addComment = handleCommentClick;
      // Add the toggle comments function to the editor
      (editor as any).toggleComments = () => setIsCommentsOpen(prev => !prev);
      // Add the comments array to the editor
      (editor as any).comments = comments;
      // Add the select comment function to the editor
      (editor as any).selectComment = handleSelectComment;
      // Add the delete comment function to the editor
      (editor as any).deleteComment = handleDeleteCommentFromDropdown;
      // Add new generate content function
      (editor as any).generateContent = handleGenerateContentClick;
    }
  }, [editor, handleCommentClick, comments, handleSelectComment, handleDeleteCommentFromDropdown, handleGenerateContentClick]);

  // Update the editor's comments when comments change
  useEffect(() => {
    if (editor) {
      (editor as any).comments = comments;
    }
  }, [editor, comments]);

  // Function to set the comment button position
  const setCommentButtonRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      const rect = node.getBoundingClientRect();
      setCommentButtonPosition({
        x: rect.left,
        y: rect.bottom + 8 // 8px below the button
      });
    }
  }, []);

  // Update comment button position when component mounts
  useEffect(() => {
    // Find the comment button in the Navbar
    const commentButton = document.querySelector('button[aria-label="Add comment"]');
    if (commentButton) {
      const rect = commentButton.getBoundingClientRect();
      setCommentButtonPosition({
        x: rect.left + rect.width / 2, // Center of the button
        y: rect.bottom + 8 // 8px below the button
      });
    }
  }, []);

  useEffect(() => {
    if (editor) {
      // Check if editor is empty
      const checkIfEmpty = () => {
        const content = editor.getHTML();
        setIsEmpty(content === '<p></p>' || content === '');
      };

      // Initial check
      checkIfEmpty();

      // Listen for updates
      editor.on('update', checkIfEmpty);

      return () => {
        editor.off('update', checkIfEmpty);
      };
    }
  }, [editor]);

  const handleSaveComment = (text: string) => {
    if (activeComment) {
      // Check if we're editing an existing comment
      const isEditing = comments.some(comment => comment.id === activeComment.id);
      
      if (isEditing) {
        // Update existing comment
        setComments(prev => prev.map(comment => 
          comment.id === activeComment.id 
            ? { ...comment, text } 
            : comment
        ));
      } else {
        // Add new comment
        const updatedComment = { ...activeComment, text };
        setComments(prev => [...prev, updatedComment]);
      }

      // Reset states
      setActiveComment(null);
      setCommentPopupPosition(null);
      setSelectedText('');
      setHighlightedComment(null);
    }
  };

  const handleDeleteComment = () => {
    if (activeComment) {
      setComments(prev => prev.filter(comment => comment.id !== activeComment.id));
      setActiveComment(null);
      setCommentPopupPosition(null);
      setSelectedText('');
    }
  };

  const handleEditComment = (comment: Comment) => {
    setActiveComment(comment);
    setCommentPopupPosition(comment.position);
    setSelectedText(comment.selectedText);
  };

  // Add CSS for highlighted text
  useEffect(() => {
    if (highlightedComment) {
      // Add a class to the editor for styling highlighted text
      const editorElement = document.querySelector('.ProseMirror');
      if (editorElement) {
        editorElement.classList.add('has-highlighted-comment');
      }
    } else {
      // Remove the class when no comment is highlighted
      const editorElement = document.querySelector('.ProseMirror');
      if (editorElement) {
        editorElement.classList.remove('has-highlighted-comment');
      }
    }
  }, [highlightedComment]);

  // Add debug logging
  useEffect(() => {
    console.log('Current comments:', comments);
  }, [comments]);

  // Update comments in editor immediately when they change
  useEffect(() => {
    if (editor) {
      (editor as any).comments = comments;
      console.log('Updated editor comments:', (editor as any).comments);
    }
  }, [editor, comments]);

  // Disable text selection in the editor when AI popup is open
  useEffect(() => {
    // Only disable text selection when there's a response in the popup
    const hasResponse = document.querySelector('.ai-popup .prose');
    if (hasResponse) {
      // Add a class to the body to disable text selection in the editor
      document.body.classList.add('ai-popup-open');
      
      // Ensure the page can still be scrolled
      document.body.style.overflow = 'auto';
      
      return () => {
        // Remove the class when the popup is closed
        document.body.classList.remove('ai-popup-open');
      };
    }
  }, [aiPopupPosition, selectedTextForAI]);

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      // If the AI popup is open with a response, don't update the selection
      const hasResponse = document.querySelector('.ai-popup .prose');
      if (hasResponse) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        // Don't immediately clear the popup when selection is collapsed
        // This allows the popup to stay open when clicking inside it
        return;
      }

      const text = selection.toString().trim();
      if (text) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Calculate position relative to the document
        const x = rect.left + (rect.width / 2);
        const y = rect.top + window.scrollY; // Add scroll offset for absolute positioning
        
        console.log('Text selected for AI:', text);
        console.log('Selection position:', { x, y });
        
        setSelectedTextForAI(text);
        setAiPopupPosition({ x, y });
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  // Handle clicking outside to close AI popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if we have a response in the popup
      const hasResponse = document.querySelector('.ai-popup .prose');
      
      // Only close if:
      // 1. Clicking outside the popup AND
      // 2. Not on a selection AND
      // 3. Not when there's a response (keep response popup open until explicitly closed)
      if (!target.closest('.ai-popup') && !window.getSelection()?.toString() && !hasResponse) {
        setAiPopupPosition(null);
      }
    };

    // Add a small delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add this function to handle the placeholder
  const addPlaceholder = () => {
    if (!editor) return;
    
    // Add a class to the first paragraph if the editor is empty
    const updatePlaceholder = () => {
      const isEmpty = editor.isEmpty;
      const firstParagraph = editor.view.dom.querySelector('p');
      
      if (firstParagraph) {
        if (isEmpty) {
          firstParagraph.classList.add('is-editor-empty');
        } else {
          firstParagraph.classList.remove('is-editor-empty');
        }
      }
    };
    
    // Initial update
    updatePlaceholder();
    
    // Listen for updates
    editor.on('update', updatePlaceholder);
    
    return () => {
      editor.off('update', updatePlaceholder);
    };
  };

  // Add the placeholder effect
  useEffect(() => {
    if (editor) {
      return addPlaceholder();
    }
  }, [editor]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    handlePreviewContent,
    handleRejectContent
  }))

  if (!editor) return null;

  return (
    <div className="w-full h-full relative">
      <EditorContent 
        editor={editor} 
        className="h-full" 
      />
      
      {generateContentPosition && (
        <GenerateContentPopup
          position={generateContentPosition}
          selectedText={editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to
          )}
          fullText={editor.state.doc.textBetween(0, editor.state.doc.content.size)}
          onClose={() => setGenerateContentPosition(null)}
          onPreviewContent={handlePreviewContent}
          onRejectContent={handleRejectContent}
        />
      )}
      
      {/* Render comment popup */}
      {commentPopupPosition && (
        <CommentPopup
          position={commentPopupPosition}
          onClose={() => {
            setActiveComment(null);
            setCommentPopupPosition(null);
            setHighlightedComment(null);
          }}
          onSave={handleSaveComment}
          onDelete={handleDeleteComment}
          initialComment={activeComment?.text || ''}
          isEditing={!!activeComment?.text}
          selectedText={selectedText}
        />
      )}
      
      {/* Hidden element to get comment button position */}
      <div 
        ref={setCommentButtonRef} 
        className="hidden"
        data-comment-button-position
      />
    </div>
  );
}

// Create a forwarded ref version of the component
export default forwardRef<RichTextEditorRef, Props>(RichTextEditor)
