"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AlignLeft, 
  Bold, 
  ChevronDown, 
  Code, 
  Italic, 
  List, 
  ListOrdered, 
  Strikethrough, 
  Underline,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  MessageSquareMore,
  Smile,
  Ellipsis,
  X,
  MessageCirclePlus,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Settings
} from "lucide-react";
import ColorPicker from "./ColorPicker";
import { Editor } from "@tiptap/react";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

type Props = {
    editor: Editor | null
}

const defaultOptions = [
  { label: "Header", value: "Header" },
  { label: "Title", value: "Title" },
  { label: "Subtitle", value: "Subtitle" },
  { label: "Normal Text", value: "Normal Text" },
];

const alignmentOptions = [
  { icon: AlignLeft, value: 'left' },
  { icon: AlignCenter, value: 'center' },
  { icon: AlignRight, value: 'right' },
  { icon: AlignJustify, value: 'justify' }
];

const calloutTypes = [
  { type: 'info', icon: AlertCircle, label: 'Information' },
  { type: 'success', icon: CheckCircle2, label: 'Best Practice' },
  { type: 'warning', icon: AlertTriangle, label: 'Warning' },
  { type: 'error', icon: XCircle, label: 'Error' },
];

const Navbar = ({ editor }: Props) => {
  const [selected, setSelected] = useState<string>("Normal Text");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [options, setOptions] = useState(defaultOptions);
  const [isAlignOpen, setIsAlignOpen] = useState<boolean>(false);
  const [currentAlign, setCurrentAlign] = useState<string>('left');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [linkText, setLinkText] = useState<string>('');
  const [isLinkActive, setIsLinkActive] = useState<boolean>(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isCalloutOpen, setIsCalloutOpen] = useState<boolean>(false);
  const [currentCalloutType, setCurrentCalloutType] = useState<string>('info');
  const [isNestingEnabled, setIsNestingEnabled] = useState<boolean>(false);
  
  // Add states for format toggles
  const [formatStates, setFormatStates] = useState({
    bold: false,
    underline: false,
    italic: false,
    strikethrough: false,
    code: false,
    bulletList: false,
    orderedList: false
  });

  // Add state for settings popup
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [calloutCommands, setCalloutCommands] = useState<{ [key: string]: string }>({
    info: '',
    success: '',
    warning: '',
    error: ''
  });
  const [tempCalloutCommands, setTempCalloutCommands] = useState<{ [key: string]: string }>({
    info: '',
    success: '',
    warning: '',
    error: ''
  });

  // Update format states when editor state changes
  useEffect(() => {
    if (!editor) return;

    const updateFormatStates = () => {
      setFormatStates({
        bold: editor.isActive('bold'),
        underline: editor.isActive('underline'),
        italic: editor.isActive('italic'),
        strikethrough: editor.isActive('strike'),
        code: editor.isActive('code'),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList')
      });

      // Update current alignment
      if (editor.isActive({ textAlign: 'left' })) {
        setCurrentAlign('left');
      } else if (editor.isActive({ textAlign: 'center' })) {
        setCurrentAlign('center');
      } else if (editor.isActive({ textAlign: 'right' })) {
        setCurrentAlign('right');
      } else if (editor.isActive({ textAlign: 'justify' })) {
        setCurrentAlign('justify');
      }

      // Update selected text style
      if (editor.isActive('heading', { level: 1 })) {
        setSelected('Title');
      } else if (editor.isActive('heading', { level: 2 })) {
        setSelected('Subtitle');
      } else if (editor.isActive('heading', { level: 3 })) {
        setSelected('Header');
      } else {
        setSelected('Normal Text');
      }

      // Check if link is active
      setIsLinkActive(editor.isActive('link'));
      
      // If link is active, get the current URL
      if (editor.isActive('link')) {
        const attrs = editor.getAttributes('link');
        setLinkUrl(attrs.href || '');
      } else {
        setLinkUrl('');
      }
    };

    // Update on selection change
    editor.on('selectionUpdate', updateFormatStates);
    // Update on transaction (content change)
    editor.on('update', updateFormatStates);

    // Initial update
    updateFormatStates();

    return () => {
      editor.off('selectionUpdate', updateFormatStates);
      editor.off('update', updateFormatStates);
    };
  }, [editor]);

  // Get comments from editor
  useEffect(() => {
    if (editor) {
      // Get comments from editor
      const getComments = () => {
        const editorComments = (editor as any).comments || [];
        setComments(editorComments);
      };
      
      // Initial get
      getComments();
      
      // Listen for updates
      editor.on('update', getComments);
      
      return () => {
        editor.off('update', getComments);
      };
    }
  }, [editor]);

  const toggleFormat = (format: keyof typeof formatStates) => {
    if (!editor) return;
    
    switch (format) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'strikethrough':
        editor.chain().focus().toggleStrike().run();
        break;
      case 'code':
        editor.chain().focus().toggleCode().run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        // Update the state immediately after toggling
        setFormatStates(prev => ({
          ...prev,
          bulletList: editor.isActive('bulletList')
        }));
        return; // Return early to prevent the default state update
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        // Update the state immediately after toggling
        setFormatStates(prev => ({
          ...prev,
          orderedList: editor.isActive('orderedList')
        }));
        return; // Return early to prevent the default state update
    }

    // Update the state immediately after toggling
    setFormatStates(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  const handleSelect = (value: string) => {
    if (!editor) return;
    
    // Set the selected value first
    setSelected(value);
    setIsOpen(false);
    
    // Get the current selection
    const { from, to } = editor.state.selection;
    
    // Apply the selected text style
    switch (value) {
      case 'Header':
        editor.chain()
          .focus()
          .setNode('heading', { level: 3, inline: false })
          .run();
        break;
      case 'Title':
        editor.chain()
          .focus()
          .setNode('heading', { level: 1, inline: false })
          .run();
        break;
      case 'Subtitle':
        editor.chain()
          .focus()
          .setNode('heading', { level: 2, inline: false })
          .run();
        break;
      case 'Normal Text':
        editor.chain()
          .focus()
          .setNode('paragraph')
          .run();
        break;
      default:
        // If the selected value is not already in options, add it
        // if (!options.some(option => option.value === value)) {
        //   setOptions([...options, { label: value, value: value }]);
        // }
    }
  };

  const handleAlignSelect = (value: string) => {
    if (!editor) return;
    
    setCurrentAlign(value);
    setIsAlignOpen(false);
    
    editor.chain().focus().setTextAlign(value).run();
  };

  const getCurrentAlignIcon = () => {
    switch (currentAlign) {
      case 'center':
        return AlignCenter;
      case 'right':
        return AlignRight;
      case 'justify':
        return AlignJustify;
      default:
        return AlignLeft;
    }
  };

  const toggleLink = () => {
    if (!editor) return;
    
    // If link is active, open dialog with current URL
    if (editor.isActive('link')) {
      const attrs = editor.getAttributes('link');
      setLinkUrl(attrs.href || '');
      setLinkText(editor.state.selection.content().content.firstChild?.textContent || '');
      setIsLinkDialogOpen(true);
    } else {
      // If no link is active, open dialog with empty fields
      setLinkUrl('');
      setLinkText('');
      setIsLinkDialogOpen(true);
    }
  };

  const addLink = () => {
    if (!editor) return;
    
    // If URL is empty, remove the link
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
      setIsLinkDialogOpen(false);
      return;
    }
    
    // If we have both text and URL, insert new linked text
    if (linkText && linkUrl) {
      editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run();
    } 
    // If we just have a URL and text is selected, add link to selection
    else if (editor.state.selection.content().content.size > 0) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    // If we have a URL but no text and no selection, insert a link with the URL as text
    else {
      editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkUrl}</a>`).run();
    }
    
    setIsLinkDialogOpen(false);
  };

  const removeLink = () => {
    if (!editor) return;
    
    editor.chain().focus().unsetLink().run();
    setIsLinkDialogOpen(false);
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    if (!editor) return;
    
    // Insert the emoji at the current cursor position
    editor.chain().focus().insertContent(emojiData.emoji).run();
  };

  const toggleComment = () => {
    if (!editor) return;
    
    // Get the comment button position
    const commentButton = document.querySelector('[data-comment-button-position]');
    if (commentButton) {
      const rect = commentButton.getBoundingClientRect();
      // Update the position in the editor
      (editor as any).commentButtonPosition = {
        x: rect.left,
        y: rect.bottom + 8 // 8px below the button
      };
    }
    
    // Call the addComment function
    (editor as any).addComment();
  };

  const toggleComments = () => {
    if (!editor) return;
    setIsCommentsOpen(!isCommentsOpen);
  };

  const handleSelectComment = (comment: any) => {
    if (!editor) return;
    (editor as any).selectComment(comment);
  };

  const handleDeleteComment = (id: string) => {
    if (!editor) return;
    (editor as any).deleteComment(id);
  };

  const toggleCallout = () => {
    if (!editor) return;
    editor.chain().focus().toggleCallout(currentCalloutType).run();
  };

  const handleCalloutTypeSelect = (type: string) => {
    setCurrentCalloutType(type);
    if (editor) {
      const hasSelection = !editor.state.selection.empty;
      const isInCallout = editor.isActive('callout');
      
      // If nesting is enabled and text is selected
      if (isNestingEnabled && hasSelection) {
        // Always create a new callout for the selected text when nesting is enabled
        editor.chain()
          .focus()
          .wrapIn('callout', { type })
          .run();
      } else {
        // If nesting is disabled or no selection
        if (isInCallout) {
          // Just update the type of the current callout
          editor.chain().focus().updateCalloutType(type).run();
        } else {
          // Create a new callout
          editor.chain().focus().toggleCallout(type).run();
        }
      }
    }
    setIsCalloutOpen(false);
  };

  const handleGenerateContent = () => {
    if (!editor) return;
    (editor as any).generateContent?.();
  };

  // Function to handle command change
  const handleCommandChange = (type: string, command: string) => {
    setTempCalloutCommands(prev => ({ ...prev, [type]: command }));
  };

  // Function to capture keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: string) => {
    e.preventDefault();
    
    // Construct key combination string
    let keys = [];
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    if (e.metaKey) keys.push('Meta');
    
    // Add the key if it's not a modifier key
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      keys.push(e.key);
    }
    
    const shortcut = keys.join('+');
    
    // Set the keyboard shortcut
    setTempCalloutCommands(prev => ({ ...prev, [type]: shortcut }));
  };

  // Function to apply changes
  const applySettings = () => {
    // Save the settings
    setCalloutCommands(tempCalloutCommands);
    setIsSettingsOpen(false);
    
    // If editor is available, update the callout shortcuts in the extension
    if (editor) {
      editor.commands.setCalloutShortcuts(tempCalloutCommands);
    }
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('calloutCommands', JSON.stringify(tempCalloutCommands));
    } catch (error) {
      console.error('Failed to save callout commands to localStorage:', error);
    }
  };

  // Function to discard changes
  const discardSettings = () => {
    // Reset temporary commands to current settings
    setTempCalloutCommands({ ...calloutCommands });
    setIsSettingsOpen(false);
  };

  // Load saved commands on initial render
  useEffect(() => {
    try {
      const savedCommands = localStorage.getItem('calloutCommands');
      if (savedCommands) {
        const parsedCommands = JSON.parse(savedCommands);
        setCalloutCommands(parsedCommands);
        setTempCalloutCommands(parsedCommands);
        
        // If editor is available, set the shortcuts
        if (editor) {
          editor.commands.setCalloutShortcuts(parsedCommands);
        }
      }
    } catch (error) {
      console.error('Failed to load callout commands from localStorage:', error);
    }
  }, [editor]); // Add editor as a dependency so shortcuts are set when editor becomes available

  // Handle keyboard shortcuts for callouts
  useEffect(() => {
    if (!editor) return;
    
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      // Construct the pressed key combination
      let keys = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.altKey) keys.push('Alt');
      if (e.shiftKey) keys.push('Shift');
      if (e.metaKey) keys.push('Meta');
      
      // Add the key if it's not a modifier key
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        keys.push(e.key);
      }
      
      const pressedShortcut = keys.join('+');
      
      // Check if the pressed shortcut matches any of the saved commands
      Object.entries(calloutCommands).forEach(([type, shortcut]) => {
        if (shortcut && pressedShortcut === shortcut) {
          // Stop default browser behavior
          e.preventDefault();
          
          // Execute the command to toggle the callout
          editor.chain().focus().toggleCallout(type).run();
        }
      });
    };
    
    // Add event listener
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [editor, calloutCommands]);

  const AlignIcon = getCurrentAlignIcon();

  return (
    <div className="w-full flex flex-col items-center sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200 py-3">
      {/* Navbar */}
      <div className="inline-flex items-center h-10 border border-gray-200 rounded-md shadow-sm text-gray-600 relative bg-white">
        <div className="relative">
          <button
            className="p-1 mr-3 ml-3 flex items-center gap-1.5"
            onClick={() => setIsOpen(!isOpen)}
            data-tooltip="Text Style"
          >
            {selected}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              <ChevronDown className="w-5" />
            </motion.div>
          </button>
          
          {/* Dropdown (appears below without pushing content) */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? "auto" : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 top-[calc(100%+8px)] overflow-hidden w-[200px] bg-white border-2 rounded-lg border-gray-200 shadow-md z-10"
          >
            <ul>
              {options.map((option) => (
                <li
                  key={option.value}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${selected === option.value ? 'bg-gray-100' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
        
        <div className="border-r border-gray-200 border-1 mr-3 h-6"></div>
        <ColorPicker editor={editor} />
        <div className="border-r border-gray-200 border-1 mr-3 h-6"></div>
        <button 
          className={`p-1 mr-3 rounded transition-colors ${formatStates.bold ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          onClick={() => toggleFormat('bold')}
          data-tooltip="Bold (Ctrl+B)"
        >
          <Bold className="h-5 w-5" />
        </button>
        <button 
          className={`p-1 mr-3 rounded transition-colors ${formatStates.underline ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          onClick={() => toggleFormat('underline')}
          data-tooltip="Underline (Ctrl+U)"
        >
          <Underline className="h-5 w-5" />
        </button>
        <button 
          className={`p-1 mr-3 rounded transition-colors ${formatStates.italic ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          onClick={() => toggleFormat('italic')}
          data-tooltip="Italic (Ctrl+I)"
        >
          <Italic className="h-5 w-5" />
        </button>
        <button 
          className={`p-1 mr-3 rounded transition-colors ${formatStates.strikethrough ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          onClick={() => toggleFormat('strikethrough')}
          data-tooltip="Strikethrough"
        >
          <Strikethrough className="h-5 w-5" />
        </button>
        <button 
          className={`p-1 mr-3 rounded transition-colors ${formatStates.code ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          onClick={() => toggleFormat('code')}
          data-tooltip="Code"
        >
          <Code className="h-5 w-5" />
        </button>
        <div className="border-r border-gray-200 border-1 mr-3 h-6"></div>
        <button 
          className={`p-1 mr-3 rounded transition-colors ${formatStates.bulletList ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          onClick={() => toggleFormat('bulletList')}
          data-tooltip="Bullet List"
        >
          <List className="h-5 w-5" />
        </button>
        <button 
          className={`p-1 mr-3 rounded transition-colors ${formatStates.orderedList ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          onClick={() => toggleFormat('orderedList')}
          data-tooltip="Numbered List"
        >
          <ListOrdered className="h-5 w-5" />
        </button>
        <div className="relative">
          <button 
            className="relative group w-6 h-6 p-1 mr-3"
            onClick={() => setIsAlignOpen(!isAlignOpen)}
            data-tooltip="Text Alignment"
          >
            <AlignIcon className="h-5 w-5" />
            <div className="absolute bottom-[2px] -right-[7px] w-0 h-0 
                border-t-[4px] border-t-gray-400 
                border-l-[4px] border-l-transparent 
                border-r-[4px] border-r-transparent" />
          </button>

          {/* Alignment Dropdown */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isAlignOpen ? 1 : 0, height: isAlignOpen ? "auto" : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 top-[calc(100%+8px)] overflow-hidden bg-white border-2 rounded-lg border-gray-200 shadow-md z-10"
          >
            <div className="p-1 flex">
              {alignmentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    className={`p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center ${currentAlign === option.value ? 'bg-gray-100' : ''}`}
                    onClick={() => handleAlignSelect(option.value)}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
        <div className="border-r border-gray-200 border-1 ml-2 mr-3 h-6"></div>
        <div className="relative">
          <button 
            className={`p-1 mr-3 rounded transition-colors ${isLinkActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            onClick={toggleLink}
            data-tooltip="Insert Link (Ctrl+K)"
          >
            <LinkIcon className="h-5 w-5" />
          </button>
          
          {/* Link Dialog */}
          {isLinkDialogOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 bg-white border-2 rounded-lg border-gray-200 shadow-md p-4 w-80 z-20">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Insert Link</h3>
                <button 
                  onClick={() => setIsLinkDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Text to display</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addLink();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                {isLinkActive && (
                  <button
                    onClick={removeLink}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Remove
                  </button>
                )}
                <button
                  onClick={addLink}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {isLinkActive ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button 
            className={`p-1 mr-3 rounded transition-colors hover:bg-gray-100`}
            onClick={toggleEmojiPicker}
            data-tooltip="Insert Emoji"
          >
            <Smile className="h-5 w-5" />
          </button>
          
          {/* Emoji Picker */}
          {isEmojiPickerOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-20">
              <div className="relative">
                <button
                  onClick={() => setIsEmojiPickerOpen(false)}
                  className="absolute top-2 right-2 z-30 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button 
            className={`p-1 mr-3 rounded transition-colors hover:bg-gray-100`}
            onClick={toggleComment}
            aria-label="Add comment"
            data-tooltip="Add Comment"
          >
            <MessageCirclePlus className="h-5 w-5" />
          </button>
        </div>
        <div className="relative">
          <button 
            className={`p-1 mr-3 rounded transition-colors hover:bg-gray-100 flex items-center gap-1`}
            onClick={toggleComments}
            aria-label="View comments"
            data-tooltip="View Comments"
          >
            <MessageSquare className="h-5 w-5" />
            {comments.length > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {comments.length}
              </span>
            )}
          </button>
          
          {isCommentsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 top-[calc(100%+8px)] w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium text-sm">Comments</h3>
                <button 
                  onClick={() => setIsCommentsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No comments yet
                  </div>
                ) : (
                  <ul>
                    {comments.map((comment) => (
                      <li 
                        key={comment.id}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <button
                          onClick={() => {
                            handleSelectComment(comment);
                            setIsCommentsOpen(false);
                          }}
                          className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium line-clamp-1">{comment.text}</p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{comment.selectedText}</p>
                            </div>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteComment(comment.id);
                              }}
                              className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </div>
        <div className="relative">
          <button 
            className={`p-1 mr-3 rounded transition-colors hover:bg-gray-100 flex items-center gap-1`}
            onClick={() => setIsCalloutOpen(!isCalloutOpen)}
            aria-label="Add callout"
            data-tooltip="Add Callout"
          >
            <AlertCircle className="h-5 w-5" />
          </button>
          
          {isCalloutOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 top-[calc(100%+8px)] w-60 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-medium text-sm">Add Callout</h3>
              </div>
              <div className="p-2">
                {/* Add nesting toggle button */}
                <button
                  onClick={() => setIsNestingEnabled(!isNestingEnabled)}
                  className={`w-full p-2 mb-2 flex items-center justify-between rounded border ${
                    isNestingEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <span className="text-sm">Enable Nesting</span>
                  <div className={`w-8 h-4 rounded-full transition-colors ${
                    isNestingEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    <div className={`w-3 h-3 rounded-full bg-white transform transition-transform mt-0.5 ${
                      isNestingEnabled ? 'translate-x-4 ml-0.5' : 'translate-x-0 ml-0.5'
                    }`} />
                  </div>
                </button>
                
                {/* Existing callout type buttons */}
                {calloutTypes.map((callout) => {
                  const Icon = callout.icon;
                  return (
                    <button
                      key={callout.type}
                      onClick={() => handleCalloutTypeSelect(callout.type)}
                      className={`w-full p-2 flex items-center gap-2 rounded hover:bg-gray-100 ${
                        currentCalloutType === callout.type ? 'bg-gray-100' : ''
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${
                        callout.type === 'info' ? 'text-blue-500' :
                        callout.type === 'success' ? 'text-green-500' :
                        callout.type === 'warning' ? 'text-yellow-500' :
                        'text-red-500'
                      }`} />
                      <span className="text-sm">{callout.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
        <div className="border-r border-gray-200 border-1 mr-3 h-6"></div>
        <button
          onClick={handleGenerateContent}
          className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          title="Generate content with AI"
          aria-label="Generate content"
        >
          <Sparkles className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1 mr-3 hover:bg-gray-100 rounded-lg"
            data-tooltip="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute right-0 top-[calc(100%+8px)] w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium text-sm">Customize Callout Commands</h3>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                {calloutTypes.map(callout => (
                  <div key={callout.type} className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{callout.label} Command</label>
                    <input
                      type="text"
                      value={tempCalloutCommands[callout.type]}
                      onChange={(e) => handleCommandChange(callout.type, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, callout.type)}
                      placeholder="Press keyboard shortcut"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                ))}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={discardSettings}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Discard
                  </button>
                  <button
                    onClick={applySettings}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
