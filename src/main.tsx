import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'
import './index.css'

// Minimal runtime diagnostics for production: capture unhandled errors
const showFatalOverlay = (title: string, message: string) => {
  try {
    const el = document.createElement('div')
    el.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:99999',
      'background:rgba(15,23,42,0.9)',
      'color:#fff',
      'font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif',
      'padding:24px',
      'overflow:auto',
    ].join(';')
    el.innerHTML = `
      <div style="max-width:960px;margin:40px auto;background:#111827;border:1px solid #374151;border-radius:8px;padding:16px 20px">
        <div style="font-weight:600;font-size:18px;margin-bottom:8px">${title}</div>
        <pre style="white-space:pre-wrap;word-break:break-word;margin:0;font-size:13px;line-height:1.4">${message}</pre>
      </div>`
    document.body.appendChild(el)
  } catch {
    // ignore
  }
}

// Pre-fill root so a fully blank page is less likely
const rootEl = document.getElementById('root')!
if (rootEl && !rootEl.firstChild) rootEl.textContent = 'Loading…'

// Global error listeners (also help if error occurs before React mounts)
window.addEventListener('error', (ev) => {
  const err = ev.error || ev.message || 'Unknown error'
  showFatalOverlay('Runtime error', String(err))
})
window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
  const reason = (ev && (ev as any).reason) || ev || 'Unhandled rejection'
  showFatalOverlay('Unhandled promise rejection', String(reason))
})

createRoot(rootEl).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
