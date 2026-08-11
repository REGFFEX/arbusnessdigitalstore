import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import './styles/tailwind.css'

import { ARDESProvider } from './context/ARDESContext'
import { AdsProvider } from './context/AdsContext'
import { BrandingProvider } from './context/BrandingContext'

import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ARDESProvider>
        <AdsProvider>
          <BrandingProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </BrandingProvider>
        </AdsProvider>
      </ARDESProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
