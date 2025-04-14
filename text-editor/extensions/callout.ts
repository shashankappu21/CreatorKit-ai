import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
  shortcuts?: Record<string, string>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Toggle a callout
       */
      toggleCallout: (type: string) => ReturnType;
      /**
       * Update callout type
       */
      updateCalloutType: (type: string) => ReturnType;
      /**
       * Exit the current callout
       */
      exitCallout: () => ReturnType;
      /**
       * Set custom shortcuts for callouts
       */
      setCalloutShortcuts: (shortcuts: Record<string, string>) => ReturnType;
    };
  }
}

export const CalloutNode = Node.create<CalloutOptions>({
  name: 'callout',

  addOptions() {
    return {
      HTMLAttributes: {},
      shortcuts: {},
    };
  },

  content: 'block+',

  group: 'block',

  defining: true,

  draggable: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-type') || 'info',
        renderHTML: attributes => ({
          'data-type': attributes.type,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[class=callout]',
        getAttrs: element => {
          if (typeof element === 'string') return {};
          const dom = element as HTMLElement;
          return { type: dom.getAttribute('data-type') || 'info' };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'callout' }), 0];
  },

  addCommands() {
    return {
      toggleCallout:
        (type: string) =>
        ({ commands, chain, state }) => {
          const isActive = this.editor.isActive('callout');
          
          if (isActive) {
            // If we're already in a callout, check if it's the same type
            const currentType = this.editor.getAttributes('callout').type;
            if (currentType === type) {
              // If it's the same type, lift the content out of the callout
              return commands.lift(this.name);
            } else {
              // If it's a different type, update the type
              return chain()
                .updateAttributes(this.name, { type })
                .run();
            }
          }

          // If we have a selection, wrap it in a callout
          if (!state.selection.empty) {
            return chain()
              .focus()
              .wrapIn(this.name, { type })
              .run();
          }

          // If no selection, create an empty callout
          return chain()
            .insertContent({
              type: this.name,
              attrs: { type },
              content: [{ type: 'paragraph' }],
            })
            .run();
        },

      updateCalloutType:
        (type: string) =>
        ({ chain }) => {
          return chain()
            .updateAttributes(this.name, { type })
            .run();
        },

      exitCallout:
        () =>
        ({ chain, state }) => {
          const { $head } = state.selection;
          const pos = $head.after();
          
          return chain()
            .insertContentAt(pos, { type: 'paragraph' })
            .lift($head.parent.type.name)
            .focus()
            .run();
        },
      
      setCalloutShortcuts:
        (shortcuts: Record<string, string>) =>
        ({ chain }) => {
          // Update the shortcuts option
          this.options.shortcuts = shortcuts;
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    // Default shortcuts for exiting callouts (not type-specific)
    const baseShortcuts: Record<string, any> = {
      'Enter': ({ editor }: { editor: any }) => {
        if (editor.isActive('callout')) {
          const { selection } = editor.state;
          const { empty, $head } = selection;
          
          // Only exit if we're at the end of an empty line
          if (empty && $head.parentOffset === $head.parent.content.size) {
            return editor.chain().focus().exitCallout().run();
          }
        }
        return false;
      },
      'Mod-Enter': ({ editor }: { editor: any }) => {
        if (editor.isActive('callout')) {
          return editor.chain().focus().exitCallout().run();
        }
        return false;
      },
      'Escape': ({ editor }: { editor: any }) => {
        if (editor.isActive('callout')) {
          return editor.chain().focus().exitCallout().run();
        }
        return false;
      },
    };

    // We don't add type-specific shortcuts here anymore
    // The Navbar component will handle the custom shortcuts via event listeners
    
    return baseShortcuts;
  },
}); 