import { FC, useState, FormEvent, useEffect } from 'react'
import { Map, Array } from 'yjs'
import { usarDoc } from '../contexto'
import { usePositioner } from 'remirror/react/hooks'
import { Provedor, usarEditor } from '../editor'
import Compressor from 'compressorjs'
import { Link, useHistory } from 'react-router-dom'
import {
  Contrast16,
  Education16,
  Printer16,
  Send16,
  ThumbsUp16,
  TableOfContents16,
  Undo16,
  Redo16,
  Number_116,
  Number_216,
  Number_316,
  Number_416,
  Number_516,
  TextIndent16,
  ListBulleted16,
  ImageReference16,
  DataTableReference16,
  TextBold16,
  TextItalic16,
  TextUnderline16,
  Home16,
  Row16,
  OpenPanelLeft16,
  OpenPanelRight16,
  OpenPanelTop16,
  OpenPanelBottom16,
  VirtualColumn16,
  RowDelete16,
  ColumnDelete16,
  CloseOutline24,
  RadioButton24,
  CheckmarkOutline24,
} from '@carbon/icons-react'

const padrões = {
  imagem: {
    tipo: 'figura',
    arquivo: null as File,
  },
  tabela: {
    linhas: '',
    colunas: '',
  },
  atuais: {
    aprovador: null as number,
    referência: null as number,
  },
  menus: {
    sumário: false,
    impressão: false,
    imagem: false,
    tabela: false,
    aprovador: false,
    referência: false,
  },
}
const YBoolean: FC<{
  mapa: Map<boolean>
  nome?: string
  campo: string
}> = props => (
  <fieldset>
    <label htmlFor={props.campo}>
      {props.nome || props.campo}
      <input
        hidden
        id={props.campo}
        type="checkbox"
        checked={props.mapa.get(props.campo)}
        onChange={e => props.mapa.set(props.campo, e.target.checked)}
      />
      {props.mapa.get(props.campo) ? <CheckmarkOutline24 /> : <RadioButton24 />}
    </label>
  </fieldset>
)
const YString: FC<{
  mapa: Map<string>
  campo: string
  nome?: string
}> = props => (
  <fieldset>
    <legend>{props.nome || props.campo}</legend>
    <div
      contentEditable
      onBlur={e => props.mapa.set(props.campo, e.target.innerText)}
      dangerouslySetInnerHTML={{ __html: props.mapa.get(props.campo)! }}
    />
  </fieldset>
)
const YArray: FC<{
  array: Array<string>
  nome: string
}> = props => (
  <fieldset>
    <legend>{props.nome}</legend>
    {props.array.map((valor: string, i) => (
      <span key={i}>
        {valor}
        <CloseOutline24 onClick={() => props.array.delete(i)} />
      </span>
    ))}
    <div
      contentEditable
      onBlur={e => {
        if (e.target.innerText) {
          props.array.push([e.target.innerText])
          e.target.innerText = ''
        }
      }}
    />
  </fieldset>
)
const Editor = () => {
  try {
    const telaPequena = innerWidth < 1024
    const doc = usarDoc()
    const editor = usarEditor()
    const [menus, pôrMenus] = useState(padrões.menus)
    const [citações, pôrCitações] = useState(false)
    const [imagem, pôrImagem] = useState(padrões.imagem)
    const [tabela, pôrTabela] = useState(padrões.tabela)
    const [atuais, pôrAtuais] = useState(padrões.atuais)
    const { ref, active, top, left } = usePositioner('bubble')
    const aprovador = doc.getArray<any>('aprovadores').get(atuais.aprovador)
    const referência = doc.getArray<any>('referências').get(atuais.referência)
    const eventos: { [nome: string]: (e: FormEvent) => void } = {
      imagem(e) {
        e.preventDefault()
        new Compressor(imagem.arquivo!, {
          maxWidth: 605,
          convertSize: Infinity,
          quality: 0.5,
          success(blob) {
            const leitor = new FileReader()
            leitor.onload = e => {
              editor.pôrImagem(imagem.tipo, e.target!.result as string)
              pôrImagem(padrões.imagem)
            }
            leitor.readAsDataURL(blob)
          },
        })
      },
      tabela(e) {
        e.preventDefault()
        editor.pôrTabela(+tabela.linhas, +tabela.colunas)
        pôrTabela(padrões.tabela)
      },
    }
    useEffect(
      () => editor.addHandler('updated', () => pôrMenus(padrões.menus)),
      []
    )

    return (
      <div data-serifa={editor.meta.serifa}>
        <aside className="impressão" />
        <section className="edição">
          <header>
            {telaPequena ? (
              <>
                <button
                  data-ativo={menus.impressão}
                  onClick={() =>
                    pôrMenus({ ...padrões.menus, impressão: !menus.impressão })
                  }
                >
                  <Education16 />
                </button>
                <button
                  data-ativo={menus.sumário}
                  onClick={() =>
                    pôrMenus({ ...padrões.menus, sumário: !menus.sumário })
                  }
                >
                  <TableOfContents16 />
                </button>
              </>
            ) : (
              <button onClick={editor.imprimir}>
                <Printer16 />
              </button>
            )}
          </header>
          <article>
            <main
              {...editor.getRootProps()}
              data-resumo={editor.seções.resumo}
              data-abstract={editor.seções.abstract}
              data-referências={editor.seções.referências}
            />
          </article>
          <footer>
            {telaPequena && (
              <>
                <button onClick={editor.yUndo}>
                  <Undo16 />
                </button>
                <button onClick={editor.yRedo}>
                  <Redo16 />
                </button>
              </>
            )}
            {editor.table() ? (
              <>
                <button onClick={editor.toggleTableHeaderRow}>
                  <Row16 />
                </button>
                <button onClick={editor.addTableRowAfter}>
                  <OpenPanelBottom16 />
                </button>
                <button onClick={editor.addTableColumnAfter}>
                  <OpenPanelRight16 />
                </button>
                <button onClick={editor.addTableRowBefore}>
                  <OpenPanelTop16 />
                </button>
                <button onClick={editor.addTableColumnBefore}>
                  <OpenPanelLeft16 />
                </button>
                <button onClick={editor.toggleTableCellMerge}>
                  <VirtualColumn16 />
                </button>
                <button onClick={editor.deleteTableRow}>
                  <RowDelete16 />
                </button>
                <button onClick={editor.deleteTableColumn}>
                  <ColumnDelete16 />
                </button>
              </>
            ) : (
              <>
                <button
                  data-ativo={editor.heading({ level: 1 })}
                  onClick={() => editor.toggleHeading({ level: 1 })}
                >
                  <Number_116 />
                </button>
                <button
                  data-ativo={editor.heading({ level: 2 })}
                  onClick={() => editor.toggleHeading({ level: 2 })}
                >
                  <Number_216 />
                </button>
                <button
                  data-ativo={editor.heading({ level: 3 })}
                  onClick={() => editor.toggleHeading({ level: 3 })}
                >
                  <Number_316 />
                </button>
                <button
                  data-ativo={editor.heading({ level: 4 })}
                  onClick={() => editor.toggleHeading({ level: 4 })}
                >
                  <Number_416 />
                </button>
                <button
                  data-ativo={editor.heading({ level: 5 })}
                  onClick={() => editor.toggleHeading({ level: 5 })}
                >
                  <Number_516 />
                </button>
                <button
                  data-ativo={editor.blockquote()}
                  onClick={editor.toggleBlockquote}
                >
                  <TextIndent16 />
                </button>
                <button
                  data-ativo={editor.bulletList()}
                  onClick={editor.toggleBulletList}
                >
                  <ListBulleted16 />
                </button>
                <button
                  data-ativo={menus.imagem}
                  onClick={() =>
                    pôrMenus({ ...padrões.menus, imagem: !menus.imagem })
                  }
                >
                  <ImageReference16 />
                </button>
                <button
                  data-ativo={menus.tabela}
                  onClick={() =>
                    pôrMenus({ ...padrões.menus, tabela: !menus.tabela })
                  }
                >
                  <DataTableReference16 />
                </button>
              </>
            )}
            <button
              onClick={() => document.body.toggleAttribute('data-escuro')}
            >
              <Contrast16 />
            </button>
          </footer>
          <aside ref={ref} hidden={!active} style={{ top, left }}>
            <button
              data-ativo={editor.bold()}
              onClick={() => editor.toggleBold()}
            >
              <TextBold16 />
            </button>
            <button
              data-ativo={editor.italic()}
              onClick={() => editor.toggleItalic()}
            >
              <TextItalic16 />
            </button>
            <button
              data-ativo={editor.underline()}
              onClick={editor.toggleUnderline}
            >
              <TextUnderline16 />
            </button>
          </aside>
          <button>
            <Link to="/">
              <Home16 />
            </Link>
          </button>
          <dialog open={menus.impressão}>
            <YString
              mapa={doc.getMap('meta')}
              campo="vínculo"
              nome="Instituição"
            />
            <YArray array={doc.getArray('autores')} nome="Autores" />
            <YString mapa={doc.getMap('meta')} campo="título" />
            <YString mapa={doc.getMap('meta')} campo="local" nome="Cidade" />
            <YString mapa={doc.getMap('meta')} campo="data" nome="Ano" />
            <YString mapa={doc.getMap('meta')} campo="gênero" />
            <YString mapa={doc.getMap('meta')} campo="objetivo" />
            <YArray array={doc.getArray('orientadores')} nome="Orientadores" />
            <fieldset>
              <legend>Aprovadores</legend>
              {editor.meta.aprovadores!.map((aprovador, i) => (
                <span>
                  <span
                    onClick={() => {
                      pôrAtuais({ ...atuais, aprovador: i })
                      pôrMenus({ ...menus, aprovador: true })
                    }}
                  >
                    {aprovador.nome || 'Sem nome'}
                  </span>
                  <CloseOutline24
                    onClick={() => doc.getArray('aprovadores').delete(i)}
                  />
                </span>
              ))}
              <div
                onClick={() => {
                  const array = doc.getArray('aprovadores')
                  array.push([new Map()])
                  pôrAtuais({ ...atuais, aprovador: array.length - 1 })
                  pôrMenus({ ...menus, aprovador: true })
                }}
              />
            </fieldset>
            <hr hidden />
            <YBoolean mapa={doc.getMap('seções')} campo="resumo" />
            <YBoolean mapa={doc.getMap('seções')} campo="abstract" />
            <YBoolean
              mapa={doc.getMap('meta')}
              campo="ilustrações"
              nome="Lista de ilustrações"
            />
            <YBoolean
              mapa={doc.getMap('meta')}
              campo="tabelas"
              nome="Lista de tabelas"
            />
            <YBoolean mapa={doc.getMap('seções')} campo="referências" />
            <YBoolean
              mapa={doc.getMap('meta')}
              campo="verso"
              nome="Frente e verso"
            />
            <YBoolean
              mapa={doc.getMap('meta')}
              campo="linhas"
              nome="Linhas pontilhadas"
            />
            <YBoolean
              mapa={doc.getMap('meta')}
              campo="serifa"
              nome="Times New Roman"
            />
            {telaPequena && (
              <button onClick={editor.imprimir}>
                <Printer16 />
              </button>
            )}
          </dialog>
          <dialog open={menus.sumário}>
            <article>
              <div>
                {editor.sumário.map(
                  (
                    seção,
                    i //@ts-ignore
                  ) => (
                    <seção.tipo key={i} data-vista={seção.vista} />
                  )
                )}
              </div>
              <div>
                {editor.sumário.map((seção, i) => (
                  //@ts-ignore
                  <seção.tipo
                    key={i}
                    onClick={seção.irAté}
                    data-vista={seção.vista}
                  >
                    {seção.título}
                  </seção.tipo>
                ))}
              </div>
            </article>
          </dialog>
          <dialog open={citações}>
            <fieldset>
              <label htmlFor=""></label>
            </fieldset>
            <button>Adicionar referência</button>
          </dialog>
          <dialog open={menus.imagem}>
            <form onSubmit={eventos.imagem}>
              <fieldset>
                <legend>Tipo</legend>
                <select
                  value={imagem.tipo}
                  onChange={e => pôrImagem({ ...imagem, tipo: e.target.value })}
                >
                  {[
                    'desenho',
                    'esquema',
                    'figura',
                    'fluxograma',
                    'fotografia',
                    'gráfico',
                    'imagem',
                    'mapa',
                    'organograma',
                    'planta',
                    'quadro',
                    'retrato',
                  ].map(tipo => (
                    <option value={tipo}>{tipo}</option>
                  ))}
                </select>
              </fieldset>
              <fieldset>
                <legend>Arquivo</legend>
                <label htmlFor="arquivo">
                  {imagem.arquivo?.name || 'Escolher arquivo'}
                </label>
                <input
                  hidden
                  type="file"
                  id="arquivo"
                  onChange={e =>
                    pôrImagem({ ...imagem, arquivo: e.target.files![0] })
                  }
                />
              </fieldset>
              <button disabled={!imagem.arquivo}>
                <Send16 />
              </button>
            </form>
          </dialog>
          <dialog open={menus.tabela}>
            <form onSubmit={eventos.tabela}>
              <fieldset>
                <legend>Linhas</legend>
                <input
                  type="number"
                  value={tabela.linhas}
                  onChange={e =>
                    pôrTabela({ ...tabela, linhas: e.target.value })
                  }
                />
              </fieldset>
              <fieldset>
                <legend>Colunas</legend>
                <input
                  type="number"
                  value={tabela.colunas}
                  onChange={e =>
                    pôrTabela({ ...tabela, colunas: e.target.value })
                  }
                />
              </fieldset>
              <button disabled={!(tabela.linhas && tabela.colunas)}>
                <Send16 />
              </button>
            </form>
          </dialog>
          <dialog open={menus.aprovador}>
            {menus.aprovador && aprovador && (
              <>
                <YString mapa={aprovador} campo="nome" />
                <YString mapa={aprovador} campo="título" />
                <YString mapa={aprovador} campo="vínculo" nome="Instituição" />
              </>
            )}
            <button onClick={() => pôrMenus({ ...menus, aprovador: false })}>
              <ThumbsUp16 />
            </button>
          </dialog>
          <dialog open={menus.referência}>
            {menus.referência && referência && (
              <>
                <YString mapa={referência} campo="chave" />
                <YString mapa={referência} campo="título" />
                <YString mapa={referência} campo="data" />
                <YArray array={referência.get('autores')} nome="Autores" />
              </>
            )}
          </dialog>
        </section>
      </div>
    )
  } catch (e) {
    useHistory().go(0)
  }
}
export default () => (
  <Provedor>
    <Editor />
  </Provedor>
)
