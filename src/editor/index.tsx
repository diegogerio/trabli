import { Meta } from '../tipos/interfaces'
import { FC, useState, useEffect } from 'react'
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react'
import { WebrtcProvider } from 'y-webrtc'
import { criarExtensões } from './extensoes'
import { YjsExtension } from 'remirror/extension/yjs'
import { DOMParser } from 'prosemirror-model'
import { $ } from '../funcoes'
import { toHtml } from 'remirror/core'
import { criarImpressão } from '../impressor'
import { usarDoc } from '../contexto'

export const Provedor: FC = props => {
  const doc = usarDoc()
  const provedor = new WebrtcProvider(doc.guid, doc)
  provedor.awareness.setLocalStateField('user', {
    name: localStorage.nome || 'Anônimo',
    color: localStorage.cor || '#1a73e9',
  })
  useEffect(() => provedor.destroy, [])
  return (
    <RemirrorProvider
      autoFocus
      manager={useManager([
        ...criarExtensões(),
        new YjsExtension({ getProvider: () => provedor }),
      ])}
    >
      {props.children}
    </RemirrorProvider>
  )
}
export const usarEditor = () => {
  const [seções, pôrSeções] = useState({
    resumo: false,
    abstract: false,
    referências: false,
  })
  const [sumário, pôrSumário] = useState<
    {
      tipo: string
      título: string
      vista: boolean
      irAté: () => void
    }[]
  >([])
  const [meta, pôrMeta] = useState<Meta>({
    vínculo: '',
    autores: [],
    título: '',
    local: '',
    data: '',
    gênero: '',
    objetivo: '',
    orientadores: [],
    aprovadores: [],
    referências: [],
    verso: false,
    serifa: false,
    linhas: false,
    ilustrações: false,
    tabelas: false,
  })
  const arrays = Object.entries(meta)
    .filter(([, valor]) => valor instanceof Array)
    .map(([campo]) => campo)
  const doc = usarDoc()
  const tipos = [doc.getMap('meta'), ...arrays.map(tipo => doc.getArray(tipo))]
  const { getState, view, addHandler, active, commands, getRootProps } =
    useRemirror({ autoUpdate: true })
  const pôrHTML = (html: string) => {
    const { schema, selection, tr } = getState()
    const contêiner = document.createElement('div')
    contêiner.innerHTML = html
    const { content } = DOMParser.fromSchema(schema).parseSlice(contêiner)
    view.dispatch(tr.insert(selection.anchor, content))
  }
  const pôrIlustração = (tipo: string, conteúdo: string) => {
    pôrHTML(`<figure class="${tipo}"><p></p>${conteúdo}<p></p></figure>`)
  }
  const atualizarMeta = () =>
    pôrMeta({
      ...meta,
      ...doc.getMap('meta').toJSON(),
      ...arrays.reduce((final, campo) => {
        final[campo] = doc.getArray(campo).toJSON()
        return final
      }, {}),
    })
  const atualizarSeções = () =>
    pôrSeções({
      ...seções,
      ...doc.getMap('seções').toJSON(),
    })
  const atualizarSumário = () =>
    pôrSumário(
      Array.from(
        document
          .querySelector('.ProseMirror')
          ?.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5') || [],
        seção => ({
          tipo: seção.tagName.toLowerCase(),
          título: seção.textContent,
          vista: scrollY + innerHeight >= seção.offsetTop,
          irAté: () => scrollTo({ top: seção.offsetTop - 74 }),
        })
      )
    )
  useEffect(() => {
    atualizarMeta()
    atualizarSeções()
    atualizarSumário()
    addHandler('updated', atualizarSumário)
    tipos.forEach(tipo => tipo.observeDeep(atualizarMeta))
    doc.getMap('seções').observe(atualizarSeções)
    onscroll = atualizarSumário
  }, [])
  return {
    meta,
    sumário,
    seções,
    ...active,
    ...commands,
    addHandler,
    getRootProps,
    pôrImagem(tipo: string, imagem: string, largura?: number) {
      pôrIlustração(
        tipo,
        `<p><img src="${imagem}"${$` width="${largura}%"`}></p>`
      )
    },
    pôrTabela(linhas: number, colunas: number) {
      const células = `<tr>${`<td></td>`.repeat(colunas)}</tr>`.repeat(linhas)
      pôrIlustração('tabela', `<table><tbody>${células}</tbody></table>`)
    },
    async imprimir() {
      const { Previewer } = await import('pagedjs/dist/paged')
      const visualizador = new Previewer()
      const { schema, doc } = getState()
      let html = toHtml({ schema, node: doc })
      if (!seções.resumo)
        html = html.replace(/<section class="resumo">.+?<\/section>/, '')
      if (!seções.abstract)
        html = html.replace(/<section class="abstract">.+?<\/section>/, '')
      if (!seções.referências)
        html = html.replace(/<section class="referencias">.+?<\/section>/, '')
      const conteúdo = criarImpressão(html, meta)
      const impressão = document.querySelector<HTMLElement>('.impressão')
      impressão.innerHTML = ''
      await visualizador.preview(conteúdo, ['midia.css'], impressão)
      print()
    },
  }
}
