import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupMockElectronAPI } from './mockElectronAPI'
import './index.css'
import App from './App.tsx'

// Enable mock API fallback when run in a standard web browser context
setupMockElectronAPI();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
