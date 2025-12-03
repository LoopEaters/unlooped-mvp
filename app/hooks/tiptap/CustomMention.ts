import Mention from '@tiptap/extension-mention'
import { mergeAttributes } from '@tiptap/core'

/**
 * Entity type 정보를 포함하는 커스텀 Mention extension
 */
export const CustomMention = Mention.extend({
  name: 'mention',

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-id': attributes.id,
          }
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {}
          }
          return {
            'data-label': attributes.label,
          }
        },
      },
      type: {
        default: 'unknown',
        parseHTML: (element) => element.getAttribute('data-entity-type') || 'unknown',
        renderHTML: (attributes) => {
          return {
            'data-entity-type': attributes.type || 'unknown',
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ]
  },

  // 🔧 FIX: renderLabel deprecated → renderText + renderHTML로 교체
  renderText({ node }) {
    return `@${node.attrs.label ?? node.attrs.id}`
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        {
          'data-type': this.name,
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      `@${node.attrs.label ?? node.attrs.id}`,
    ]
  },
})
