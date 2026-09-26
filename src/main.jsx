import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import ThemeOverridesProvider from './context/ThemeOverridesProvider.jsx'
import './styles/tokens.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeOverridesProvider>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </ThemeOverridesProvider>
    </BrowserRouter>
  </StrictMode>,
)
