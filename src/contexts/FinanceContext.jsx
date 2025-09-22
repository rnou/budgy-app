import React, { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

const API_BASE_URL = 'http://localhost:3001';

export const FinanceProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savingsPots, setSavingsPots] = useState([]);
  const [recurringBills, setRecurringBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userRes, statsRes, transactionsRes, budgetsRes, savingsRes, billsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/user`),
        fetch(`${API_BASE_URL}/stats`),
        fetch(`${API_BASE_URL}/transactions`),
        fetch(`${API_BASE_URL}/budgets`),
        fetch(`${API_BASE_URL}/savingsPots`),
        fetch(`${API_BASE_URL}/recurringBills`)
      ]);

      const userData = await userRes.json();
      const statsData = await statsRes.json();
      const transactionsData = await transactionsRes.json();
      const budgetsData = await budgetsRes.json();
      const savingsData = await savingsRes.json();
      const billsData = await billsRes.json();

      setUser(userData);
      setStats(statsData);
      setTransactions(transactionsData);
      setBudgets(budgetsData);
      setSavingsPots(savingsData);
      setRecurringBills(billsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  // Add new transaction
  const addTransaction = async (transactionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transactionData,
          id: Date.now(),
          date: new Date().toISOString().split('T')[0]
        })
      });
      
      if (response.ok) {
        const newTransaction = await response.json();
        setTransactions(prev => [newTransaction, ...prev]);
        await fetchData(); // Refresh all data to update stats
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction');
    }
  };

  // Update transaction
  const updateTransaction = async (transactionId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatedData,
          id: transactionId,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        const updatedTransaction = await response.json();
        setTransactions(prev => 
          prev.map(t => t.id === transactionId ? updatedTransaction : t)
        );
        await fetchData(); // Refresh to update stats
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError('Failed to update transaction');
    }
  };

  // Delete transaction
  const deleteTransaction = async (transactionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        await fetchData(); // Refresh to update stats
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction');
    }
  };

  // Update savings pot
  const updateSavingsPot = async (potId, newAmount) => {
    try {
      const pot = savingsPots.find(p => p.id === potId);
      if (!pot) return;

      const response = await fetch(`${API_BASE_URL}/savingsPots/${potId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          saved: newAmount
        })
      });

      if (response.ok) {
        const updatedPot = await response.json();
        setSavingsPots(prev => prev.map(p => p.id === potId ? updatedPot : p));
      }
    } catch (err) {
      console.error('Error updating savings pot:', err);
      setError('Failed to update savings pot');
    }
  };

  // Update budget
  const updateBudget = async (budgetId, spent) => {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spent })
      });

      if (response.ok) {
        const updatedBudget = await response.json();
        setBudgets(prev => prev.map(b => b.id === budgetId ? updatedBudget : b));
      }
    } catch (err) {
      console.error('Error updating budget:', err);
      setError('Failed to update budget');
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const value = {
    // Data
    user,
    stats,
    transactions,
    budgets,
    savingsPots,
    recurringBills,
    
    // States
    loading,
    error,
    
    // Actions
    refreshData: fetchData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateSavingsPot,
    updateBudget,
    
    // Computed values
    totalSavings: savingsPots.reduce((sum, pot) => sum + pot.saved, 0),
    recentTransactions: transactions.slice(0, 5),
    upcomingBills: recurringBills.filter(bill => bill.status === 'pending')
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};