import { Meta } from './tipos/interfaces'
import { createContext, useContext, FC, useState, useEffect } from 'react'
import { IndexeddbPersistence } from 'y-indexeddb'
import { Doc } from 'yjs'
import { getCurrentUrl } from 'preact-router'

const contexto =
  createContext<
    [IndexeddbPersistence[], (persistências: IndexeddbPersistence[]) => void]
  >(null)
export const Provedor: FC = props => {
  const [pronto, pôrPronto] = useState(false)
  const [persistências, pôrPersistências] = useState<IndexeddbPersistence[]>([])
  useEffect(() => {
    indexedDB.databases().then(async bancos => {
      pôrPersistências(
        await Promise.all(
          bancos.map(
            ({ name }) =>
              new IndexeddbPersistence(name, new Doc({ guid: name })).whenSynced
          )
        )
      )
      pôrPronto(true)
    })
  }, [])
  return (
    <contexto.Provider value={[persistências, pôrPersistências]}>
      {pronto ? props.children : 'Carregando...'}
    </contexto.Provider>
  )
}
export const usarDoc = () => {
  const guid = getCurrentUrl().slice(1)
  const [persistências, pôrPersistências] = useContext(contexto)
  const persistência = persistências.find(({ doc }) => doc.guid == guid)
  if (persistência) return persistência.doc
  else {
    const persistência = new IndexeddbPersistence(guid, new Doc({ guid }))
    useEffect(() => () => pôrPersistências([...persistências, persistência]))
    return persistência.doc
  }
}
export const usarMetas = () => {
  const [persistências, pôrPersistências] = useContext(contexto)
  return persistências.map(({ doc }, i) => ({
    chave: doc.guid,
    ...(doc.getMap('meta').toJSON() as Meta),
    remover() {
      persistências[i].clearData()
      persistências.splice(i, 1)
      pôrPersistências(persistências)
    },
  }))
}
