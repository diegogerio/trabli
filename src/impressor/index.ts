export * from './citador'
import { Meta } from '../tipos/interfaces'
import { nanoid } from 'nanoid'
import { $, _ } from '../funcoes'
import { partirTítulo } from './citador'

/** Gera e guarda identificadores únicos */
export class Lista {
  itens: {
    id: string
    extra: string
  }[] = []
  /** Adiciona um item à lista
  @arg extra Uma informação adicional sobre o item */
  incluir(extra: string) {
    const id = `_${nanoid()}`
    this.itens.push({ id, extra })
    return id
  }
}
/** Percorre um texto listando certos elementos */
const criarListas = (html: string, referências: string) => {
  const sumário = new Lista()
  const ilustrações = new Lista()
  return {
    conteúdo: html
      .replace(
        /<h(\d)>/g,
        (_, tipo) => `<h${tipo} id="${sumário.incluir(tipo)}">`
      )
      .replace(
        /<figure class="(.+?)"><p>/g,
        (_, tipo) =>
          `<figure class="${tipo}"><p id="${ilustrações.incluir(tipo)}">`
      ),
    sumário: $`<nav class="sumário">${[
      ...sumário.itens.map(
        item => `<h${item.extra}><a href="#${item.id}"></a></h${item.extra}>`
      ),
      referências ? '<h6><a href="#referencias">Referências</a></h6>' : '',
    ]}</nav>`,
    ilustrações: $`<nav class="ilustrações">${ilustrações.itens
      .filter(item => item.extra != 'tabela')
      .map(
        item => `<p class="${item.extra}"><a href="#${item.id}"></a></p>`
      )}</nav>`,
    tabelas: $`<nav class="tabelas">${ilustrações.itens
      .filter(item => item.extra == 'tabela')
      .map(
        item => `<p class="${item.extra}"><a href="#${item.id}"></a></p>`
      )}</nav>`,
  }
}
/** Recebe um texto em HTML e seus metadados, gerando um documento finalizado */
export const criarImpressão = (html: string, meta: Meta) => {
  const criarClasses = (...campos: (keyof Meta)[]) =>
    $` class="${_(
      '',
      'trabalho',
      ...campos.map(campo => meta[campo] && campo)
    )}"`
  const { título, subtítulo } = partirTítulo(meta.título)
  const autorTítulo = $`
    <ul class="autores">${meta.autores
      .sort()
      .map(autor => `<li>${autor}</li>`)}</ul>
    <p class="título"><strong>${título}</strong>${$`: ${subtítulo}`}</p>`
  const localData = $`
    <p class="local">${meta.local}</p>
    <p class="data">${meta.data}</p>`
  const natureza = $`<p class="natureza">
    ${meta.gênero} apresentado(a) ao(à) ${meta.vínculo} para
    ${
      meta.objetivo
        ? meta.objetivo[0].toLowerCase() + meta.objetivo.slice(1)
        : ''
    }
  </p>`
  const [, seções, resto] = html.split(/(<section.+\/section>)/g)
  const [resumos, referências] = (seções || '').split(
    /<section class="referencias"><ul>(.+)<\/ul><\/section>/
  )
  console.log({ seções, resumos, referências })
  const listas = criarListas(resto || html, referências)
  return $`
    <article${criarClasses('verso', 'linhas')}>
      <header>
        ${$`<section class="capa">
          ${$`<p class="vínculo">${meta.vínculo}</p>`}
          ${autorTítulo}
          ${localData}
        </section>`}
        ${$`<section class="rosto">
          ${autorTítulo}
          ${natureza}
          ${$`<p class="orientação">${_('e', ...meta.orientadores)}</p>`}
          ${localData}
        </section>`}
        ${
          meta.aprovadores?.length
            ? $`<section class="aprovação">
          ${autorTítulo}
          ${natureza}
          <ul class="aprovadores">${meta.aprovadores.map(
            aprovador => `<li>
            <p>${aprovador.título} ${aprovador.nome}</p>
            <p>${aprovador.vínculo || meta.vínculo}</p>
          </li>`
          )}</ul>
        </section>`
            : ''
        }
        ${resumos || ''}
        ${meta.ilustrações ? listas.ilustrações : ''}
        ${meta.tabelas ? listas.tabelas : ''}
        ${listas.sumário}
      </header>
      <main>
        ${listas.conteúdo}
      </main>
      ${
        referências
          ? `<footer><ul id="referencias">${referências}</ul></footer>`
          : ''
      }
    </article>
  `
}
