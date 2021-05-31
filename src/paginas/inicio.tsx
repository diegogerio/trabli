import { usarMetas } from '../contexto'
import { Link } from 'react-router-dom'
import { nanoid } from 'nanoid'
import { FolderAdd24, TrashCan24 } from '@carbon/icons-react'
import { useRef } from 'react'

export default () => {
  const metas = usarMetas()
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
          <Link to={`/${nanoid(11)}`}>
            <button>
              <FolderAdd24 />
            </button>
          </Link>
        </form>
        <ul>
          {metas.map(meta => {
            const item = useRef<HTMLLIElement>(null)
            return (
              <li key={meta.chave} ref={item}>
                <Link to={`/${meta.chave}`}>{meta.título || 'Sem título'}</Link>{' '}
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
