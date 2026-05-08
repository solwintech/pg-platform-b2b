import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import 'bootstrap/dist/css/bootstrap.min.css'; // Add Bootstrap CSS
import './theme/custom.css'; // Changed from custom.scss to custom.css
import './index.css';

function App() {
  return (
    <BrowserRouter basename="/staynest">
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;