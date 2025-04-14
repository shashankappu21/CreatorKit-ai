import React, { useState } from 'react';
import { X, Loader2, Bot, HelpCircle, Check, X as XIcon } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

interface GenerateContentPopupProps {
  position: { x: number; y: number };
  selectedText: string | null;
  fullText: string;
  onClose: () => void;
  onPreviewContent: (content: string) => void;
  onRejectContent?: () => void;
}

type Mode = 'generate' | 'ask';

export default function GenerateContentPopup({
  position,
  selectedText,
  fullText,
  onClose,
  onPreviewContent,
  onRejectContent
}: GenerateContentPopupProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [useContext, setUseContext] = useState<boolean>(false);
  const [isContextSelectionVisible, setIsContextSelectionVisible] = useState<boolean>(false);
  const [contextType, setContextType] = useState<'selected' | 'full'>('selected');
  const [mode, setMode] = useState<Mode>('generate');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [diffContent, setDiffContent] = useState<string>('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError('');
    setAiResponse('');
    setShowDiff(false);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is missing');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let contextText = '';
      if (useContext) {
        contextText = contextType === 'selected' && selectedText 
          ? selectedText 
          : fullText;
      }

      const promptWithContext = useContext
        ? `${prompt}\n\nContext:\n${contextText}`
        : prompt;

      // Different prompts based on mode
      const finalPrompt = mode === 'generate'
        ? `Generate a response in plain text format. Do not include any formatting, markdown, or special characters. Here's the request:\n\n${promptWithContext}`
        : `Please help answer this question about the text: ${promptWithContext}`;

      // const response = await ai.models.generateContent({
      //   model: "gemini-2.0-flash",
      //   contents: finalPrompt,
      //   // @ts-ignore - Ignoring type error for generationConfig
      //   generationConfig: {
      //     temperature: 0.7,
      //     topK: 40,
      //     topP: 0.95,
      //     maxOutputTokens: 2048,
      //   },
      // });

      const response = await axios.post('http://localhost:8000/generate', {
        prompt: finalPrompt,
        temperature: 0.7,
        max_tokens: 2048
      });

      const text = response.data.content || '';
      
      if (mode === 'generate') {
        // Clean up any special characters or formatting for generate mode
        const cleanText = text
          .replace(/[*`#_~]/g, '')
          .replace(/\n\n+/g, '\n\n')
          .trim();
        
        // Show the generated content in the popup instead of applying it directly
        setDiffContent(cleanText);
        setShowDiff(true);
        
        // We no longer need to store the original content or call onPreviewContent
        // The content will only be applied when the user accepts
      } else {
        // For ask mode, keep the markdown formatting and show in popup
        setAiResponse(text);
      }
    } catch (err) {
      console.error('AI Error:', err);
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Failed to get AI response');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptChanges = () => {
    if (diffContent) {
      // Only apply the content to the editor when the user accepts
      onPreviewContent(diffContent);
      // Close the popup
      onClose();
    }
  };

  const handleRejectChanges = () => {
    console.log('Reject button clicked');
    
    // Simply reset the state and go back to the prompt input
    setShowDiff(false);
    setDiffContent('');
    setPrompt('');
  };

  const getPlaceholder = () => {
    if (mode === 'generate') {
      return 'e.g., Write a paragraph about...';
    }
    return 'e.g., What is the main idea? How can I improve this?';
  };

  const getButtonText = () => {
    if (mode === 'generate') {
      return 'Generate';
    }
    return 'Ask AI';
  };

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-[400px]"
      style={{
        top: position.y + 'px',
        left: position.x + 'px',
        transform: 'translateX(-50%)',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="p-2 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-sm">AI Assistant</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {!aiResponse && !showDiff && (
          <>
            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setMode('generate')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                    mode === 'generate'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span>Generate</span>
                  </div>
                </button>
                <button
                  onClick={() => setMode('ask')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                    mode === 'ask'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>Ask</span>
                  </div>
                </button>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === 'generate' ? 'What would you like to generate?' : 'What would you like to ask?'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={getPlaceholder()}
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useContext}
                  onChange={(e) => {
                    setUseContext(e.target.checked);
                    if (e.target.checked) {
                      setIsContextSelectionVisible(true);
                    }
                  }}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include context from editor</span>
              </label>
            </div>

            {useContext && isContextSelectionVisible && (
              <div className="mb-4">
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={contextType === 'selected'}
                      onChange={() => setContextType('selected')}
                      disabled={!selectedText}
                      className="text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Selected text</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={contextType === 'full'}
                      onChange={() => setContextType('full')}
                      className="text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Full text</span>
                  </label>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 text-red-500 text-sm">
                {error}
              </div>
            )}

            {!isLoading && (
              <div className="flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {mode === 'generate' ? <Bot className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                  <span>{getButtonText()}</span>
                </button>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing request...</span>
              </div>
            )}
          </>
        )}

        {aiResponse && (
          <div className="flex flex-col gap-4">
            <div className="prose prose-sm max-w-none overflow-y-auto max-h-[50vh]">
              <ReactMarkdown>{aiResponse}</ReactMarkdown>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setAiResponse('');
                  setPrompt('');
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Ask Another Question
              </button>
            </div>
          </div>
        )}

        {showDiff && (
          <div className="flex flex-col gap-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Generated Content:
            </div>
            <div className="bg-gray-50 p-3 rounded-md overflow-y-auto max-h-[300px] text-sm">
              {diffContent}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleRejectChanges}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-1"
              >
                <XIcon className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={handleAcceptChanges}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>Accept</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 