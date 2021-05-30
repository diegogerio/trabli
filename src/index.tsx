import './estilos/index.scss'
import { lazy, Suspense } from 'react'
import { render } from 'react-dom'
import { Provedor } from './contexto'
import { Router, Route } from 'preact-router'

const Início = lazy(() => import('./paginas/inicio'))
const Edição = lazy(() => import('./paginas/edicao'))

render(
  <Suspense fallback="Carregando...">
    <Provedor>
      {/* @ts-ignore */}
      <Router>
        <Route path="/" component={Início} />
        <Route path="/:trabalho" component={Edição} />
      </Router>
    </Provedor>
  </Suspense>,
  document.querySelector('main')
)
