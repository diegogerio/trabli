import { usarMetas } from '../contexto'
import { route } from 'preact-router'
import { nanoid } from 'nanoid'
import { FolderAdd24, TrashCan24 } from '@carbon/icons-react'
import { useRef } from 'react'

export default () => {
  const metas = usarMetas()
  const novoTrabalho = () => route(`/${nanoid(11)}`)
  return (
    <section className="início">
      <div>
        <header>
          <img src="logo.png" />
        </header>
        <form>
          <input
            type="color"
            defaultValue={localStorage.cor || '#1a73e9'}
            onChange={e => (localStorage.cor = e.target.value)}
          />
          <input
            type="text"
            placeholder="Seu nome"
            defaultValue={localStorage.nome}
            onChange={e => (localStorage.nome = e.target.value)}
          />
          <button onClick={novoTrabalho}>
            <FolderAdd24 />
          </button>
        </form>
        <ul>
          {metas.map(meta => {
            const item = useRef<HTMLLIElement>(null)
            return (
              <li key={meta.chave} ref={item}>
                <a href={`/${meta.chave}`}>{meta.título || 'Sem título'}</a>{' '}
                <TrashCan24
                  onClick={() => {
                    meta.remover()
                    item.current.remove()
                  }}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
