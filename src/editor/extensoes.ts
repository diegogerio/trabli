import { NodeExtension, NodeExtensionSpec } from 'remirror/core'
import { HeadingExtension } from 'remirror/extension/heading'
import { BlockquoteExtension } from 'remirror/extension/blockquote'
import { ImageExtension } from 'remirror/extension/image'
import { TrailingNodeExtension } from 'remirror/extension/trailing-node'
import { LinkExtension } from 'remirror/extension/link'
import { BoldExtension } from 'remirror/extension/bold'
import { ItalicExtension } from 'remirror/extension/italic'
import { UnderlineExtension } from 'remirror/extension/underline'
import { ListPreset } from 'remirror/preset/list'
import { TablePreset } from 'remirror/preset/table'
import { DocExtension } from 'remirror/extension/doc'

const criarExtensão = (
  nome: string,
  tipo: string,
  conteúdo: string,
  classe = false
) =>
  new (class extends NodeExtension {
    get name() {
      return nome
    }
    createNodeSpec(): NodeExtensionSpec {
      return {
        group: 'block',
        attrs: { class: { default: null } },
        content: conteúdo,
        toDOM: ({ attrs }) => [tipo, classe ? { class: nome } : attrs, 0],
        parseDOM: [
          {
            tag: tipo,
            getAttrs: el => ({
              class: classe ? nome : (el as Element).className,
            }),
          },
        ],
      }
    }
  })({ disableExtraAttributes: true })
export const criarExtensões = () => [
  new ListPreset(),
  new TablePreset(),
  new BoldExtension({}),
  new ItalicExtension(),
  new UnderlineExtension(),
  new LinkExtension({}),
  new ImageExtension(),
  new BlockquoteExtension(),
  new TrailingNodeExtension(),
  new HeadingExtension({}),
  new DocExtension({ content: 'resumo abstract referencias heading block+' }),
  criarExtensão('resumo', 'section', 'paragraph paragraph', true),
  criarExtensão('abstract', 'section', 'paragraph paragraph', true),
  criarExtensão(
    'ilustracao',
    'figure',
    'paragraph (paragraph|table) paragraph'
  ),
  criarExtensão('referencias', 'section', 'bulletList', true),
]
