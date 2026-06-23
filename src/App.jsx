import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { GoogleMapsProvider } from './context/GoogleMapsContext';
import { AuthModalProvider } from './context/AuthModalContext';
import AuthModal from './components/auth/AuthModal';
import Chatbot from './components/common/Chatbot';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './theme/custom.css'; 
import './index.css';

function App() {
  return (
    <GoogleMapsProvider>
      <AuthModalProvider>
        <BrowserRouter>
          <AppRoutes />
          <AuthModal />
          <Chatbot />
        </BrowserRouter>
      </AuthModalProvider>
    </GoogleMapsProvider>
  );
}

export default App;