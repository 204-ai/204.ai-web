import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/archivo-black'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/instrument-serif'
import '@fontsource/instrument-serif/400-italic.css'
import './styles/global.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
