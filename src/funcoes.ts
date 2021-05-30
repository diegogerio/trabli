/** Ignora os valores inexistentes de um array */
const limparArray = (valores: any[]) =>
  valores.filter(valor => valor && valor.length != 0)
/** Monta um string caso seus valores existam */
export const $ = (peças: TemplateStringsArray, ...valores: any[]) =>
  limparArray(valores).length
    ? valores.reduce<string>((total, valor, i) => {
        if (valor instanceof Array) valor = valor.join('')
        return total + valor + peças[++i]
      }, peças[0])
    : ''
/** Une valores por um separador ignorando valores inexistentes
@arg separador Caso seja `e`, os valores são listados por vírgula */
export const _ = (separador: string, ...valores: any[]) => {
  const último = separador == 'e' && valores.pop()
  const unidos = limparArray(valores).join(último ? ', ' : `${separador} `)
  return último ? limparArray([unidos, último]).join(' e ') : unidos
}
/** Retorna a cor de melhor contraste para a cor conferida */
export const corAuxiliar = (hex: string) => {
  const [r, g, b] = hex.match(/\w{2}/g).map(nº => parseInt(nº, 16))
  return r * 299 + g * 587 + b * 114 > 128000 ? '#000000' : '#ffffff'
}
