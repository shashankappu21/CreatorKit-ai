import { Extension } from '@tiptap/core'
import { Editor } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      addComment: () => ReturnType
    }
  }
}

export const Comment = Extension.create({
  name: 'comment',

  addCommands() {
    return {
      addComment: () => ({ editor }: { editor: Editor }) => {
        // This will be handled by the RichTextEditor component
        return true
      },
    }
  },
}) 