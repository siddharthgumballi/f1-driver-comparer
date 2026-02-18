import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import App from './App'
import { WhatIfPage } from './pages/WhatIfPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<App />} />
        <Route path="/what-if" element={<WhatIfPage />} />
      </Route>
    </Routes>
  )
}
