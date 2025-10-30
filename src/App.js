import React from 'react';
import { AuthProvider } from './context/AuthContext';
import OpsPage from './components/OpsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <OpsPage />
      </div>
    </AuthProvider>
  );
}

export default App;