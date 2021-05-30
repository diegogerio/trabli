declare global {
  interface IDBFactory {
    databases: () => Promise<
      {
        name: string
        version: number
      }[]
    >
  }
}
export interface Meta {
  vínculo: string
  autores: string[]
  título: string
  local: string
  data: string
  gênero: string
  objetivo: string
  orientadores?: string[]
  aprovadores?: {
    nome?: string
    título?: string
    vínculo?: string
  }[]
  referências?: Ref[]
  serifa?: boolean
  verso?: boolean
  linhas?: boolean
  ilustrações?: boolean
  tabelas?: boolean
}
export interface Ref {
  chave: string
  título: string
  data: string
  autores?: string[]
  por?: string[]
  em?: string
  para?: string[]
  ano?: string
  número?: string
  página?: string
  seção?: string
  depositantes?: string[]
  procuradores?: string[]
  concessão?: string
  local?: string
  edição?: string
  editora?: string
  gênero?: string
  grau?: string
  curso?: string
  vínculo?: string
  aprovação?: string
  link?: string
  acesso?: string
}
export interface Cit {
  chave: string
  itens: {
    chave: string
    resto: string
    nomes: string
  }[]
  data: string
  extra?: string
  marcação: string
}
