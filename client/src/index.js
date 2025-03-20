import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import AdminRoute from './AdminRoute';
import AdminPanel from './components/AdminPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router basename="/vibe-message-in-a-bottle">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<App />} />
      </Routes>
    </Router>
  </React.StrictMode>
); 