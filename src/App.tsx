import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarConfigProvider } from '@/contexts/sidebar-context'
import { AppRouter } from '@/components/router/app-router'
import { Seo } from '@/components/seo'
import { useEffect } from 'react'
import { initGTM } from '@/utils/analytics'
import { queryClient } from '@/lib/query-client'

// Get basename from environment (for deployment) or use empty string for development
const basename = import.meta.env.VITE_BASENAME || ''

function App() {
  // Initialize GTM on app load
  useEffect(() => {
    initGTM();
  }, []);

  return (
    <div className="font-sans antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
      <Seo />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <SidebarConfigProvider>
            <Router basename={basename}>
              <AppRouter />
            </Router>
          </SidebarConfigProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  )
}

export default App
