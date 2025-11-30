import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { Toaster } from './components/ui/sonner.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="mx-50">
        <App />
        <Toaster position="top-right" richColors expand={false} closeButton />
      </div>
    </BrowserRouter>
  </StrictMode>,
)
