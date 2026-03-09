import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux"
import './styles/base.scss'
import App from './App.jsx'
import { store } from "./redux/store"
import { ToastProvider } from "./components/ToastProvider"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Provider>
  </StrictMode>,
)
