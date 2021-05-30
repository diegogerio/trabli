import { Cit, Ref } from '../tipos/interfaces'
import { _, $ } from '../funcoes'

const mesmaAutoria = (cits: Cit[]) => {
  const primeirosItens = JSON.stringify(cits[0].itens)
  return cits.every(cit => JSON.stringify(cit.itens) == primeirosItens)
}
const partirAutores = (autores?: string[]) =>
  autores
    ? autores.map(autor => {
        const [chave, resto] = autor.split(', ')
        return { chave, resto, marcação: _(',', chave.toUpperCase(), resto) }
      })
    : []
export const partirTítulo = (título?: string) => {
  const partirChave = /^((?:(?:o|a|uma)s? |(?:um|uns) )?\S+)/i
  const [, chave, resto] = título?.split(partirChave) || []
  const [real, subtítulo] = título?.split(': ') || []
  return { chave, resto, título: real, subtítulo }
}
const agruparCits = (cits: Cit[]) => ({
  por: (nome: (cit: Cit) => string) => ({
    daí: (ação: (cits: Cit[]) => void) => {
      const grupos = cits.reduce((grupos, cit) => {
        const grupo = nome(cit)
        grupos[grupo] ? grupos[grupo].push(cit) : (grupos[grupo] = [cit])
        return grupos
      }, {} as { [grupo: string]: Cit[] })
      for (const grupo in grupos)
        if (grupos[grupo].length > 1) ação(grupos[grupo])
      cits = Object.values(grupos).flat()
    },
  }),
})
const ajustarCits = (cits: Cit[]) => {
  for (let vez = 1; vez <= 3; vez++) {
    agruparCits(cits)
      .por(cit => cit.itens.map(item => item.chave + item.nomes).join())
      .daí(cits =>
        vez != 3
          ? !mesmaAutoria(cits) &&
            cits.map(cit =>
              cit.itens.map(
                vez == 1
                  ? item =>
                      (item.nomes = item.resto.replace(
                        /([A-Z])[^.\s]+/gu,
                        '$1.'
                      ))
                  : item => (item.nomes = item.resto)
              )
            )
          : agruparCits(cits)
              .por(cit => cit.data)
              .daí(cits =>
                cits.map((cit, i) => (cit.data += String.fromCharCode(97 + i)))
              )
      )
  }
  return cits
}
const marcarRef = (ref: Ref) => {
  const autores = partirAutores(ref.autores)
  const título = partirTítulo(ref.título)
  const por = partirAutores(ref.por)
  const em = partirTítulo(ref.em)
  const autoria = _(';', ...autores.map(autor => autor.marcação))
  const autoriaPor = _(';', ...por.map(autor => autor.marcação))
  const títuloFinal = _(
    ':',
    autoria
      ? ref.em
        ? título.título
        : $`<strong>${título.título}</strong>`
      : título.chave.toUpperCase() + título.resto,
    título.subtítulo
  )
  const títuloFinalEm = _(':', $`<strong>${em.título}</strong>`)
  const porEm = $`<em>In</em>: ${_('.', autoriaPor, títuloFinalEm)}`
  const edição = $`${ref.edição}. ed`
  const publicação =
    !ref.local && !ref.editora
      ? '[S. l.: s. n.]'
      : `${ref.local || '[S. l.]'}: ${ref.editora || '[s. n.]'}`
  const disponibilidade = _(
    '.',
    $`Disponível em: <a href="${ref.link}">${ref.link}</a>`,
    $`Acesso em: ${ref.acesso}`
  )
  if (ref.aprovação || ref.gênero || ref.grau || ref.curso || ref.vínculo) {
    return _(
      '.',
      autoria,
      títuloFinal,
      porEm,
      ref.aprovação,
      _(
        ',',
        _(
          ' –',
          _('', ref.gênero, $`(${_(' em', ref.grau, ref.curso)})`),
          ref.vínculo
        ),
        ref.local,
        ref.data
      ),
      disponibilidade
    )
  } else {
    return _(
      '.',
      autoria,
      títuloFinal,
      porEm,
      edição,
      _(',', publicação, ref.data),
      disponibilidade
    )
  }
}
const criarCits = ([...refs]: Ref[]) =>
  ajustarCits(
    refs
      .map(ref => {
        const autores = partirAutores(ref.autores)
        const título = partirTítulo(ref.título)
        const itens = autores?.map(({ chave, resto }) => ({
          chave,
          resto,
          nomes: '',
        })) || [{ chave: título.chave, resto: '', nomes: '' }]
        return {
          chave: ref.chave,
          itens,
          data: `<a href="${ref.chave}">${ref.data}</a>`,
          marcação: marcarRef(ref),
        } as Cit
      })
      .sort((próx, esta) => (próx.marcação > esta.marcação ? 1 : -1))
  )
export const citador = (refs: Ref[]) => ({
  cits: criarCits(refs),
  citar(parênteses: boolean, ...itens: { chave: string; extra?: string }[]) {
    const cits = itens.map(
      ({ chave, extra }) =>
        ({ ...this.cits.find(cit => cit.chave == chave), extra } as Cit)
    )
    return mesmaAutoria(cits)
      ? parênteses
        ? `(${_(
            ',',
            _(
              ';',
              ...cits[0].itens.map(item =>
                _(',', item.chave.toUpperCase(), item.nomes)
              )
            ),
            ...cits.map(cit => _(',', cit.data, cit.extra))
          )})`
        : `${_(
            'e',
            ...cits[0].itens.map(cit => _('', cit.nomes, cit.chave))
          )} (${_(',', ...cits.map(cit => _(',', cit.data, cit.extra)))})`
      : parênteses
      ? `(${_(
          ';',
          ...cits.map(cit =>
            _(
              ',',
              _(
                ';',
                ...cit.itens.map(item =>
                  _(',', item.chave.toUpperCase(), item.nomes)
                )
              ),
              cit.data,
              cit.extra
            )
          )
        )})`
      : `${_(
          'e',
          ...cits.map(cit =>
            _(',', ...cit.itens.map(item => _('', item.nomes, item.chave)))
          )
        )} (${_(',', ...cits.map(cit => _(',', cit.data, cit.extra)))})`
  },
})
