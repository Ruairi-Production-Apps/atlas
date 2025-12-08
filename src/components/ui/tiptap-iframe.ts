import { Node } from '@tiptap/core'

export interface IframeOptions {
    allowFullscreen: boolean
    HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        iframe: {
            /**
             * Set an iframe node
             */
            setIframe: (options: { src: string; width?: string | number; height?: string | number }) => ReturnType
        }
    }
}

export const Iframe = Node.create<IframeOptions>({
    name: 'iframe',

    group: 'block',

    atom: true,

    addOptions() {
        return {
            allowFullscreen: true,
            HTMLAttributes: {
                class: 'w-full aspect-video rounded-md overflow-hidden',
            },
        }
    },

    addAttributes() {
        return {
            src: {
                default: null,
            },
            frameborder: {
                default: 0,
            },
            allowfullscreen: {
                default: this.options.allowFullscreen,
            },
            width: {
                default: '100%',
            },
            height: {
                default: 400,
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'iframe',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', this.options.HTMLAttributes, ['iframe', HTMLAttributes]]
    },

    addCommands() {
        return {
            setIframe:
                (options) =>
                    ({ tr, dispatch }) => {
                        const { selection } = tr
                        const node = this.type.create(options)

                        if (dispatch) {
                            tr.replaceSelectionWith(node)
                        }

                        return true
                    },
        }
    },
})
