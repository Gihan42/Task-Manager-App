import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from "./components/ThemeProvider"
import { BoardProvider } from "./context/BoardContext"
import { TeamProvider } from "./context/TeamContext.tsx"
import { AuthProvider } from './context/AuthContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <BoardProvider>
              <TeamProvider>
                <App />
              </TeamProvider>
            </BoardProvider>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)

