import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import { MentionList } from './MentionList'
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion'

export const mentionSuggestionOptions: Omit<SuggestionOptions, 'editor'> = {
  char: '@',
  allowSpaces: false,

  render: () => {
    let component: ReactRenderer | undefined
    let popup: TippyInstance[] | undefined

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'top-start',
          theme: 'dark',
          maxWidth: 'none',
        })
      },

      onUpdate(props: SuggestionProps) {
        component?.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup?.[0]?.setProps({
          getReferenceClientRect: props.clientRect as () => DOMRect,
        })
      },

      onKeyDown(props: { event: KeyboardEvent }) {
        if (props.event.key === 'Escape') {
          popup?.[0]?.hide()
          return true
        }

        return (component?.ref as any)?.onKeyDown(props) ?? false
      },

      onExit() {
        popup?.[0]?.destroy()
        component?.destroy()
      },
    }
  },
}
