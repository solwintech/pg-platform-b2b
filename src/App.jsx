import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { GoogleMapsProvider } from './context/GoogleMapsContext';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './theme/custom.css'; 
import './index.css';

function App() {
  return (
    <GoogleMapsProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </GoogleMapsProvider>
  );
}

export default App;