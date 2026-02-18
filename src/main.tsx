import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './AppRouter'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
)
