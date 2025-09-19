import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
//import 'antd/dist/reset.css';
import 'antd/dist/antd.dark.min.css'; // ✅ Dark theme
import './theme-overrides.css';

createRoot(document.getElementById('root')).render(

  <BrowserRouter>

    <App />

  </BrowserRouter>

)
