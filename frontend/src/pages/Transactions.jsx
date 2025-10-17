import React, { useState, useMemo, useCallback } from "react";
import { Plus, Search, Filter, Edit2, Trash2, ShoppingBag, Link2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  ICON_MAP,
  TRANSACTION_CATEGORIES,
  COLOR_OPTIONS,
  FILTER_TYPES,
  DATE_FORMAT_OPTIONS,
} from "../constants/constants";

const INITIAL_FORM_STATE = {
  name: "",
  amount: "",
  category: "other",
  type: "expense",
  icon: "ShoppingBag",
  color: "bg-blue-500",
  budgetId: null,
  savingPotId: null,
};

export const Transactions = () => {
  const {
    transactions = [],
    budgets = [],
    savingsPots = [],
    loading,
    error,
    addTransaction,
    deleteTransaction,
    updateTransaction,
  } = useFinance();

  const [modalState, setModalState] = useState({
    showAddModal: false,
    showEditModal: false,
    editingTransaction: null,
  });

  const [filters, setFilters] = useState({
    searchTerm: "",
    filterType: FILTER_TYPES.ALL,
  });

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    return transactions.filter((transaction) => {
      if (!transaction) return false;

      const matchesSearch = (transaction.name || "")
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase());

      const transactionType = transaction.type?.toUpperCase();
      const filterType = filters.filterType.toUpperCase();

      const matchesType =
          filters.filterType === FILTER_TYPES.ALL ||
          transactionType === filterType;

      return matchesSearch && matchesType;
    });
  }, [transactions, filters.searchTerm, filters.filterType]);

  const handleSearchChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }));
  }, []);

  const handleFilterChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, filterType: e.target.value }));
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Based on transaction type
      if (name === 'type') {
        // INCOME: Clear both
        if (value === 'income') {
          updated.budgetId = null;
          updated.savingPotId = null;
        }
        // EXPENSE: Clear saving pot, keep budget
        else if (value === 'expense') {
          updated.savingPotId = null;
        }
        // SAVING/WITHDRAW: Clear budget, keep saving pot
        else if (value === 'saving' || value === 'withdraw') {
          updated.budgetId = null;
        }
      }

      // Clear savingPotId when budgetId is set and vice versa
      if (name === 'budgetId' && value) {
        updated.savingPotId = null;
      }
      if (name === 'savingPotId' && value) {
        updated.budgetId = null;
      }

      return updated;
    });
  }, []);

  const openAddModal = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setModalState({
      showAddModal: true,
      showEditModal: false,
      editingTransaction: null,
    });
  }, []);

  const openEditModal = useCallback((transaction) => {
    if (!transaction) return;

    setModalState({
      showAddModal: false,
      showEditModal: true,
      editingTransaction: transaction,
    });

    setFormData({
      name: transaction.name || "",
      amount: Math.abs(Number(transaction.amount) || 0).toString(),
      category: transaction.category || "other",
      type: transaction.type?.toLowerCase() || "expense",
      icon: transaction.icon || "ShoppingBag",
      color: transaction.color || "bg-blue-500",
      budgetId: transaction.budgetId || null,
      savingPotId: transaction.savingPotId || null,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({
      showAddModal: false,
      showEditModal: false,
      editingTransaction: null,
    });
    setFormData(INITIAL_FORM_STATE);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // AMOUNT HANDLING: Different for each type
      let amount = parseFloat(formData.amount);

      // EXPENSE: Store as negative
      if (formData.type === "expense") {
        amount = -Math.abs(amount);
      }
      // INCOME/SAVING/WITHDRAW: Store as positive
      else {
        amount = Math.abs(amount);
      }

      const transactionData = {
        ...formData,
        amount: amount,
        transactionDate: new Date().toISOString().split('T')[0],
        budgetId: formData.budgetId || null,
        savingPotId: formData.savingPotId || null,
      };

      if (modalState.editingTransaction) {
        await updateTransaction(
            modalState.editingTransaction.id,
            transactionData,
        );
      } else {
        await addTransaction(transactionData);
      }

      closeModal();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert(error.message || "Failed to save transaction");
    }
  };

  const handleDelete = useCallback(
      async (id) => {
        if (
            !window.confirm("Are you sure you want to delete this transaction?")
        ) {
          return;
        }

        try {
          await deleteTransaction(id);
        } catch (error) {
          console.error("Error deleting transaction:", error);
          alert(error.message || "Failed to delete transaction");
        }
      },
      [deleteTransaction],
  );

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString(
          "en-US",
          DATE_FORMAT_OPTIONS.SHORT,
      );
    } catch {
      return "Invalid date";
    }
  };

  const formatAmount = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? "0.00" : Math.abs(num).toFixed(2);
  };

  // Helper to get icon for transaction type
  const getTypeIcon = (type) => {
    const typeUpper = type?.toUpperCase();
    if (typeUpper === 'SAVING') return ArrowUpCircle;
    if (typeUpper === 'WITHDRAW') return ArrowDownCircle;
    return null;
  };

  const renderTransaction = useCallback(
      (transaction) => {
        if (!transaction) return null;

        const { id, icon, color, name, category, transactionDate, amount, type, budgetId, savingPotId } = transaction;
        const Icon = ICON_MAP[icon] || ShoppingBag;
        const isPositive = Number(amount) > 0;
        const TypeIcon = getTypeIcon(type);

        // Find linked budget or pot
        const linkedBudget = budgetId && budgets?.find(b => b.id === budgetId);
        const linkedPot = savingPotId && savingsPots?.find(p => p.id === savingPotId);

        return (
            <div key={id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div
                      className={`w-12 h-12 rounded-full ${color || "bg-gray-500"} flex items-center justify-center flex-shrink-0`}
                  >
                    {TypeIcon ? <TypeIcon size={20} className="text-white" /> : <Icon size={20} className="text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {name || "Unknown"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="capitalize">
                        {category || "other"} • {formatDate(transactionDate)}
                      </span>
                      {linkedBudget && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                            <Link2 size={12} />
                            {linkedBudget.category}
                          </span>
                      )}
                      {linkedPot && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                            <Link2 size={12} />
                            {linkedPot.name}
                          </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 flex-shrink-0">
                  <span
                      className={`text-lg font-bold ${isPositive ? "text-green-600" : "text-gray-900 dark:text-white"}`}
                  >
                    {isPositive ? "+" : ""}${formatAmount(amount)}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                        onClick={() => openEditModal(transaction)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        aria-label="Edit transaction"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Delete transaction"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
        );
      },
      [openEditModal, handleDelete, budgets, savingsPots],
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-red-800 dark:text-red-400 font-medium">
              Error loading transactions
            </h3>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
    );
  }

  return (
      <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Transactions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <Plus size={20} />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                  type="text"
                  placeholder="Search transactions..."
                  value={filters.searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <select
                  value={filters.filterType}
                  onChange={handleFilterChange}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value={FILTER_TYPES.ALL}>All Types</option>
                <option value={FILTER_TYPES.INCOME}>Income</option>
                <option value={FILTER_TYPES.EXPENSE}>Expenses</option>
                <option value={FILTER_TYPES.SAVING}>Savings</option>
                <option value={FILTER_TYPES.WITHDRAW}>Withdrawals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {filters.searchTerm || filters.filterType !== FILTER_TYPES.ALL
                      ? "No transactions match your filters."
                      : "No transactions yet. Add your first transaction to get started!"}
                </p>
              </div>
          ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map(renderTransaction)}
              </div>
          )}
        </div>

        {/* Modal */}
        {(modalState.showAddModal || modalState.showEditModal) && (
            <TransactionModal
                isOpen={modalState.showAddModal || modalState.showEditModal}
                isEditing={modalState.showEditModal}
                formData={formData}
                budgets={budgets}
                savingsPots={savingsPots}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onClose={closeModal}
            />
        )}
      </div>
  );
};

// Modal Component
const TransactionModal = ({
                            isOpen,
                            isEditing,
                            formData,
                            budgets,
                            savingsPots,
                            onFormChange,
                            onSubmit,
                            onClose,
                          }) => {
  if (!isOpen) return null;

  // DETERMINE WHAT TO SHOW BASED ON TYPE
  const showBudgetSelector = formData.type === 'expense';
  const showSavingPotSelector = formData.type === 'saving' || formData.type === 'withdraw';
  const showCategoryAndIcon = formData.type === 'income' || formData.type === 'expense';

  // Filter budgets for expenses only
  const availableBudgets = budgets?.filter(b => b.category) || [];

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isEditing ? "Edit Transaction" : "Add New Transaction"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                    name="type"
                    value={formData.type}
                    onChange={onFormChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="saving">Saving</option>
                  <option value="withdraw">Withdraw</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={onFormChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Transaction name"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                    type="number"
                    name="amount"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={onFormChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                />
              </div>

              {/* Category & Icon }
              {showCategoryAndIcon && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                          name="category"
                          value={formData.category}
                          onChange={onFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {TRANSACTION_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Icon
                      </label>
                      <select
                          name="icon"
                          value={formData.icon}
                          onChange={onFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {TRANSACTION_CATEGORIES.map((cat) => (
                            <option key={cat.icon} value={cat.icon}>
                              {cat.label}
                            </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Color
                      </label>
                      <select
                          name="color"
                          value={formData.color}
                          onChange={onFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {COLOR_OPTIONS.map((color) => (
                            <option key={color.value} value={color.value}>
                              {color.label}
                            </option>
                        ))}
                      </select>
                    </div>
                  </>
              )}

              {/* Link to Budget or Saving Pot */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1">
                  <Link2 size={16} />
                  Link Transaction (Optional)
                </label>

                <div className="space-y-3">
                  {/* Link to Budget */}
                  {showBudgetSelector && (
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Link to Budget
                        </label>
                        <select
                            name="budgetId"
                            value={formData.budgetId || ''}
                            onChange={onFormChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">No budget</option>
                          {availableBudgets.map((budget) => (
                              <option key={budget.id} value={budget.id}>
                                {budget.category} (${budget.limitAmount})
                              </option>
                          ))}
                        </select>
                        {availableBudgets.length === 0 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              No budgets available. Create one first!
                            </p>
                        )}
                      </div>
                  )}

                  {/* Link to Saving Pot */}
                  {showSavingPotSelector && (
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Link to Saving Pot {formData.type === 'saving' || formData.type === 'withdraw' ? '(Required)' : ''}
                        </label>
                        <select
                            name="savingPotId"
                            value={formData.savingPotId || ''}
                            onChange={onFormChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={formData.type === 'saving' || formData.type === 'withdraw'}
                        >
                          <option value="">Select saving pot</option>
                          {savingsPots?.map((pot) => (
                              <option key={pot.id} value={pot.id}>
                                {pot.name} (${pot.saved}/${pot.goal})
                              </option>
                          ))}
                        </select>
                        {(!savingsPots || savingsPots.length === 0) && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              No saving pots available. Create one first!
                            </p>
                        )}
                      </div>
                  )}

                  {(formData.budgetId || formData.savingPotId) && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          💡 This transaction will be tracked in {formData.budgetId ? 'the selected budget' : 'the selected saving pot'}
                        </p>
                      </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  {isEditing ? "Update" : "Add"} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default Transactions;