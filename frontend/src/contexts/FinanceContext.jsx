import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getDashboardStats,
  getTransactions,
  createTransaction,
  updateTransaction as updateTransactionAPI,
  deleteTransaction as deleteTransactionAPI,
  getBudgets,
  createBudget as createBudgetAPI,
  updateBudget as updateBudgetAPI,
  deleteBudget as deleteBudgetAPI,
  getSavingPots,
  createSavingPot as createSavingPotAPI,
  updateSavingPot as updateSavingPotAPI,
  deleteSavingPot as deleteSavingPotAPI,
  getRecurringBills,
  createRecurringBill as createRecurringBillAPI,
  updateRecurringBill as updateRecurringBillAPI,
  deleteRecurringBill as deleteRecurringBillAPI
} from '../services/apiService';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider = ({ children }) => {
  const { user: authUser, isAuthenticated } = useAuth();

  const [financialData, setFinancialData] = useState({
    dashboardStats: null,
    transactions: [],
    budgets: [],
    savingsPots: [],
    recurringBills: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !authUser?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [stats, transactions, budgets, savingsPots, recurringBills] = await Promise.all([
        getDashboardStats(authUser.id),
        getTransactions(authUser.id),
        getBudgets(authUser.id),
        getSavingPots(authUser.id),
        getRecurringBills(authUser.id)
      ]);

      setFinancialData({
        dashboardStats: stats,
        transactions,
        budgets,
        savingsPots,
        recurringBills
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authUser?.id]);

  // ==================== TRANSACTION ACTIONS ====================

  const addTransaction = async (transactionData) => {
    if (!authUser?.id) throw new Error('User not authenticated');

    try {
      const newTransaction = await createTransaction(authUser.id, transactionData);
      setFinancialData(prev => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions]
      }));
      await fetchData(); // Refresh to update stats
      return newTransaction;
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (transactionId, updatedData) => {
    if (!authUser?.id) throw new Error('User not authenticated');

    try {
      const updated = await updateTransactionAPI(authUser.id, transactionId, updatedData);
      setFinancialData(prev => ({
        ...prev,
        transactions: prev.transactions.map(t =>
            t.id === transactionId ? updated : t
        )
      }));
      await fetchData();
      return updated;
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (transactionId) => {
    if (!authUser?.id) throw new Error('User not authenticated');

    try {
      await deleteTransactionAPI(authUser.id, transactionId);
      setFinancialData(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== transactionId)
      }));
      await fetchData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  // ==================== BUDGET ACTIONS ====================

  const addBudget = async (budgetData) => {
    if (!authUser?.id) throw new Error('User not authenticated');

    try {
      const newBudget = await createBudgetAPI(authUser.id, budgetData);
      setFinancialData(prev => ({
        ...prev,
        budgets: [...prev.budgets, newBudget]
      }));
      return newBudget;
    } catch (err) {
      console.error('Error adding budget:', err);
      throw err;
    }
  };

  const updateBudget = async (budgetId, budgetData) => {
    if (!authUser?.id) throw new Error('User not authenticated');

    try {
      const updated = await updateBudgetAPI(authUser.id, budgetId, budgetData);
      setFinancialData(prev => ({
        ...prev,
        budgets: prev.budgets.map(b =>
            b.id === budgetId ? updated : b
        )
      }));
      return updated;
    } catch (err) {
      console.error('Error updating budget:', err);
      throw err;
    }
  };

  const deleteBudget = async (budgetId) => {
    if (!authUser?.id) throw new Error('User not authenticated');

    try {
      await deleteBudgetAPI(authUser.id, budgetId);
      setFinancialData(prev => ({
        ...prev,
        budgets: prev.budgets.filter(b => b.id !== budgetId)
      }));
    } catch (err) {
      console.error('Error deleting budget:', err);
      throw err;
    }
  };

  // ==================== SAVING POT ACTIONS ====================

  const addSavingPot = async (potData) => {
    if (!authUser?.id) throw new Error('User not authenticated');

    try {
      const newPot = await createSavingPotAPI(authUser.id, potData);
      setFinancialData(prev => ({
        ...prev,
        savingsPots: [...prev.savingsPots, newPot]
      }));
      return newPot;
    } catch (err) {
      console.error('Error adding saving pot:', err);
      throw err;
    }
  };

  const updateSavingPot = async (potId, potData) => {
    if (!authUser?.id) throw new Error('User not authenticated');

    try {
      const updated = await updateSavingPotAPI(authUser.id, potId, potData);
      setFinancialData(prev => ({
        ...prev,
        savingsPots: prev.savingsPots.map(p =>
            p.id === potId ? updated : p
        )
      }));
      return updated;
    } catch (err) {
      console.error('Error updating saving pot:', err);
      throw err;
    }
  };

  const deleteSavingPot = async (potId) => {
    if (!authUser?.id) throw new Error('User not authenticated');

    try {
      await deleteSavingPotAPI(authUser.id, potId);
      setFinancialData(prev => ({
        ...prev,
        savingsPots: prev.savingsPots.filter(p => p.id !== potId)
      }));
    } catch (err) {
      console.error('Error deleting saving pot:', err);
      throw err;
    }
  };

  // ==================== RECURRING BILL ACTIONS ====================

  const addRecurringBill = async (billData) => {
    if (!authUser?.id) throw new Error('User not authenticated');

    try {
      const newBill = await createRecurringBillAPI(authUser.id, billData);
      setFinancialData(prev => ({
        ...prev,
        recurringBills: [...prev.recurringBills, newBill]
      }));
      return newBill;
    } catch (err) {
      console.error('Error adding recurring bill:', err);
      throw err;
    }
  };

  const updateRecurringBill = async (billId, billData) => {
    if (!authUser?.id) throw new Error('User not authenticated');

    try {
      const updated = await updateRecurringBillAPI(authUser.id, billId, billData);
      setFinancialData(prev => ({
        ...prev,
        recurringBills: prev.recurringBills.map(b =>
            b.id === billId ? updated : b
        )
      }));
      return updated;
    } catch (err) {
      console.error('Error updating recurring bill:', err);
      throw err;
    }
  };

  const deleteRecurringBill = async (billId) => {
    if (!authUser?.id) throw new Error('User not authenticated');

    try {
      await deleteRecurringBillAPI(authUser.id, billId);
      setFinancialData(prev => ({
        ...prev,
        recurringBills: prev.recurringBills.filter(b => b.id !== billId)
      }));
    } catch (err) {
      console.error('Error deleting recurring bill:', err);
      throw err;
    }
  };

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && authUser?.id) {
      fetchData();
    }
  }, [isAuthenticated, authUser?.id, fetchData]);

  // Computed values
  const computedValues = {
    totalSavings: financialData.savingsPots?.reduce((sum, pot) =>
        sum + (pot?.saved || 0), 0
    ) || 0,

    recentTransactions: financialData.transactions?.slice(0, 5) || [],

    upcomingBills: financialData.recurringBills?.filter(bill =>
        bill?.status === 'pending'
    ) || []
  };

  const value = {
    // Data
    user: authUser,
    ...financialData,

    // States
    loading,
    error,

    // Transaction Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Budget Actions
    addBudget,
    updateBudget,
    deleteBudget,

    // Saving Pot Actions
    addSavingPot,
    updateSavingPot,
    deleteSavingPot,

    // Recurring Bill Actions
    addRecurringBill,
    updateRecurringBill,
    deleteRecurringBill,

    // Refresh
    refreshData: fetchData,

    // Computed values
    ...computedValues
  };

  return (
      <FinanceContext.Provider value={value}>
        {children}
      </FinanceContext.Provider>
  );
};