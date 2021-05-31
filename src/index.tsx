import './estilos/index.scss'
import { lazy, Suspense } from 'react'
import { render } from 'react-dom'
import { Provedor } from './contexto'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'

const Início = lazy(() => import('./paginas/inicio'))
const Edição = lazy(() => import('./paginas/edicao'))

render(
  <Suspense fallback="Carregando...">
    <Provedor>
      <Router>
        <Switch>
          <Route path="/:trabalho" component={Edição} />
          <Route path="/" component={Início} />
        </Switch>
      </Router>
    </Provedor>
  </Suspense>,
  document.querySelector('main')
)
