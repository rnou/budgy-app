import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getDashboardStats,
  getTransactions,
  createTransaction,
  updateTransaction as updateTransactionAPI,
  deleteTransaction as deleteTransactionAPI,
  getBudgets,
  updateBudget as updateBudgetAPI,
  getSavingPots,
  updateSavingPot as updateSavingPotAPI,
  getRecurringBills,
} from "../services/apiService";

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

export const FinanceProvider = ({ children }) => {
  const { user: authUser, isAuthenticated } = useAuth();

  // Single state for all financial data - Improvement #3
  const [financialData, setFinancialData] = useState({
    dashboardStats: null,
    transactions: [],
    budgets: [],
    savingsPots: [],
    recurringBills: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data at once - Improvement #4
  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !authUser?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel for better performance
      const [stats, transactions, budgets, savingsPots, recurringBills] =
        await Promise.all([
          getDashboardStats(authUser.id),
          getTransactions(authUser.id),
          getBudgets(authUser.id),
          getSavingPots(authUser.id),
          getRecurringBills(authUser.id),
        ]);

      setFinancialData({
        dashboardStats: stats,
        transactions,
        budgets,
        savingsPots,
        recurringBills,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load financial data");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authUser?.id]);

  // Add transaction - Defensive programming with proper error handling
  const addTransaction = async (transactionData) => {
    if (!authUser?.id) {
      throw new Error("User not authenticated");
    }

    try {
      const newTransaction = await createTransaction(
        authUser.id,
        transactionData,
      );

      // Update state immutably
      setFinancialData((prev) => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions],
      }));

      await fetchData(); // Refresh to update calculations
    } catch (err) {
      console.error("Error adding transaction:", err);
      throw err;
    }
  };

  // Update transaction
  const updateTransaction = async (transactionId, updatedData) => {
    if (!authUser?.id) {
      throw new Error("User not authenticated");
    }

    try {
      const updated = await updateTransactionAPI(
        authUser.id,
        transactionId,
        updatedData,
      );

      setFinancialData((prev) => ({
        ...prev,
        transactions: prev.transactions.map((t) =>
          t.id === transactionId ? updated : t,
        ),
      }));

      await fetchData();
    } catch (err) {
      console.error("Error updating transaction:", err);
      throw err;
    }
  };

  // Delete transaction
  const deleteTransaction = async (transactionId) => {
    if (!authUser?.id) {
      throw new Error("User not authenticated");
    }

    try {
      await deleteTransactionAPI(authUser.id, transactionId);

      setFinancialData((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== transactionId),
      }));

      await fetchData();
    } catch (err) {
      console.error("Error deleting transaction:", err);
      throw err;
    }
  };

  // Update savings pot
  const updateSavingsPot = async (potId, potData) => {
    if (!authUser?.id) {
      throw new Error("User not authenticated");
    }

    try {
      const updated = await updateSavingPotAPI(authUser.id, potId, potData);

      setFinancialData((prev) => ({
        ...prev,
        savingsPots: prev.savingsPots.map((p) =>
          p.id === potId ? updated : p,
        ),
      }));
    } catch (err) {
      console.error("Error updating savings pot:", err);
      throw err;
    }
  };

  // Update budget
  const updateBudget = async (budgetId, budgetData) => {
    if (!authUser?.id) {
      throw new Error("User not authenticated");
    }

    try {
      const updated = await updateBudgetAPI(authUser.id, budgetId, budgetData);

      setFinancialData((prev) => ({
        ...prev,
        budgets: prev.budgets.map((b) => (b.id === budgetId ? updated : b)),
      }));
    } catch (err) {
      console.error("Error updating budget:", err);
      throw err;
    }
  };

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && authUser?.id) {
      fetchData();
    }
  }, [isAuthenticated, authUser?.id, fetchData]);

  // Computed values with defensive programming - Improvement #2
  const computedValues = {
    totalSavings:
      financialData.savingsPots?.reduce(
        (sum, pot) => sum + (pot?.saved || 0),
        0,
      ) || 0,

    recentTransactions: financialData.transactions?.slice(0, 5) || [],

    upcomingBills:
      financialData.recurringBills?.filter(
        (bill) => bill?.status === "pending",
      ) || [],
  };

  const value = {
    // Data
    user: authUser,
    ...financialData,

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
    ...computedValues,
  };

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
};
