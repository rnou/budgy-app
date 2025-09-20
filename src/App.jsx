import React from 'react';
import Layout from './components/Layout';
import { FinanceProvider } from './contexts/FinanceContext';
import './index.css';

function App() {
  return (
    <FinanceProvider>
      <div className="App">
        <Layout />
      </div>
    </FinanceProvider>
  );
}

export default App;