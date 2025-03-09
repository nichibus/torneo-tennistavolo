import React from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}

export default App;