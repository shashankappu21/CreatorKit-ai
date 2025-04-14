'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import RichTextEditor, { RichTextEditorRef } from '@/components/rich-text-editor'
import Navbar from '@/components/Navbar'
import { useEffect, useRef, useState } from 'react'
import './editor.css'
import { Comment } from '../extensions/comment'
import { CalloutNode } from '../extensions/callout'
import { Extension } from '@tiptap/core'
import { Heading } from '@tiptap/extension-heading'
import GenerateContentPopup from '@/components/GenerateContentPopup'

// Create a custom heading extension
const InlineHeading = Extension.create({
  name: 'inlineHeading',
  addGlobalAttributes() {
    return [
      {
        types: ['heading'],
        attributes: {
          class: {
            default: 'inline-heading',
          },
        },
      },
    ]
  },
})

export default function Home() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      InlineHeading,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Color,
      TextStyle,
      BulletList,
      ListItem,
      Link,
      Comment,
      CalloutNode,
    ],
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    immediatelyRender: false,
  })

  const editorRef = useRef<RichTextEditorRef>(null)
  const [showGeneratePopup, setShowGeneratePopup] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [generatePopupPosition, setGeneratePopupPosition] = useState({ x: 0, y: 0 })

  const handlePreviewContent = (content: string) => {
    if (editorRef.current) {
      editorRef.current.handlePreviewContent(content)
    }
  }

  const handleRejectContent = () => {
    if (editorRef.current) {
      editorRef.current.handleRejectContent()
    }
  }

  // Debug placeholder
  useEffect(() => {
    if (editor) {
      console.log('Editor initialized')
      
      // Log the editor's HTML content
      console.log('Editor HTML:', editor.getHTML())
      
      // Check if there are any empty nodes
      const isEmpty = editor.isEmpty
      console.log('Is editor empty?', isEmpty)
      
      // Log the editor's state
      console.log('Editor state:', editor.state)
      
      // Add a listener for updates
      editor.on('update', () => {
        console.log('Editor updated')
        console.log('Is editor empty?', editor.isEmpty)
        console.log('Editor HTML:', editor.getHTML())
      })
    }
  }, [editor])

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      <Navbar editor={editor} />
      <main className="flex-grow container mx-auto px-6 py-4">
        <div className="max-w-4xl mx-auto bg-white rounded shadow-sm h-[80vh] overflow-auto" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="p-0 h-full">
            <RichTextEditor editor={editor} ref={editorRef} />
          </div>
        </div>
        {showGeneratePopup && selectedText && (
          <GenerateContentPopup
            position={generatePopupPosition}
            selectedText={selectedText}
            fullText={editor?.getHTML() || ''}
            onClose={() => setShowGeneratePopup(false)}
            onPreviewContent={handlePreviewContent}
            onRejectContent={handleRejectContent}
          />
        )}
      </main>
      <footer className="py-4 bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            Elegant Text Editor {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}