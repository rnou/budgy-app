import React, { useState, useMemo, useCallback } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Link2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  ICON_MAP,
  CATEGORIES,
  THEME_COLORS,
  FILTER_TYPES,
  DATE_FORMAT_OPTIONS,
} from "../constants/constants";

const INITIAL_FORM_STATE = {
  name: "",
  amount: "",
  category: "General",
  type: "expense",
  icon: "ShoppingBag",
  color: "#277C78",
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
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

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
      category: transaction.category || "General",
      type: transaction.type?.toLowerCase() || "expense",
      icon: transaction.icon || "ShoppingBag",
      color: transaction.color || "#277C78",
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
      let amount = parseFloat(formData.amount);

      if (formData.type === "expense") {
        amount = -Math.abs(amount);
      } else {
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

  const handleDeleteClick = useCallback((id) => {
    setDeleteConfirm({ show: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await deleteTransaction(deleteConfirm.id);
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert(error.message || "Failed to delete transaction");
    }
  }, [deleteConfirm.id, deleteTransaction]);

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

  const formatAmount = (amount, type) => {
    const num = Number(amount);
    const absValue = Math.abs(num).toFixed(2);

    // INCOME and WITHDRAW increase balance (green, positive)
    if (type?.toUpperCase() === 'INCOME' || type?.toUpperCase() === 'WITHDRAW') {
      return `+${absValue}`;
    }

    // EXPENSE and SAVING decrease balance (black, negative)
    if (type?.toUpperCase() === 'EXPENSE' || type?.toUpperCase() === 'SAVING') {
      return `-${absValue}`;
    }

    return `${absValue}`;
  };

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
        const Icon = ICON_MAP[icon] || ICON_MAP.ShoppingBag;
        const TypeIcon = getTypeIcon(type);

        const linkedBudget = budgetId && budgets?.find(b => b.id === budgetId);
        const linkedPot = savingPotId && savingsPots?.find(p => p.id === savingPotId);

        // Determine text color
        const typeUpper = type?.toUpperCase();
        let amountColorClass = 'text-gray-900 dark:text-white';
        if (typeUpper === 'WITHDRAW' || typeUpper === 'INCOME') {
          amountColorClass = 'text-green-600';
        } else if (typeUpper === 'SAVING' || typeUpper === 'EXPENSE') {
          amountColorClass = 'text-gray-900 dark:text-white';
        }

        return (
            <div key={id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: color }}
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
              <span className={`text-lg font-bold ${amountColorClass}`}>
                {formatAmount(amount, type)}
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
                        onClick={() => handleDeleteClick(id)}
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
      [openEditModal, handleDeleteClick, budgets, savingsPots],
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
                setFormData={setFormData}
            />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
            isOpen={deleteConfirm.show}
            title="Delete Transaction"
            message="Are you sure you want to delete this transaction? This action cannot be undone."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteConfirm({ show: false, id: null })}
            variant="danger"
        />
      </div>
  );
};

// Modal Component with Icon & Color Pickers
const TransactionModal = ({
                            isOpen,
                            isEditing,
                            formData,
                            budgets,
                            savingsPots,
                            onFormChange,
                            onSubmit,
                            onClose,
                            setFormData,
                          }) => {
  if (!isOpen) return null;

  // DETERMINE WHAT TO SHOW BASED ON TYPE
  const showBudgetSelector = formData.type === 'expense';
  const showSavingPotSelector = formData.type === 'saving' || formData.type === 'withdraw';
  const showCategoryAndIcon = formData.type === 'income' || formData.type === 'expense';

  const availableBudgets = budgets?.filter(b => b.category) || [];

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category) || CATEGORIES[0];

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

              {showCategoryAndIcon && (
                  <>
                    {/* Category with Icon Picker */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category & Icon
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {CATEGORIES.map((cat) => {
                          const Icon = ICON_MAP[cat.icon];
                          const isSelected = formData.category === cat.value;

                          return (
                              <button
                                  key={cat.value}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      category: cat.value,
                                      icon: cat.icon
                                    }));
                                  }}
                                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                      isSelected
                                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                  }`}
                              >
                                <Icon size={24} className={isSelected ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'} />
                                <span className={`text-xs ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                            {cat.label}
                          </span>
                              </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Theme Color
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {THEME_COLORS.map((colorOption) => (
                            <button
                                key={colorOption.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, color: colorOption.value }))}
                                className={`w-10 h-10 rounded-lg transition-transform ${
                                    formData.color === colorOption.value ? 'ring-2 ring-gray-900 dark:ring-white scale-110' : ''
                                }`}
                                style={{ backgroundColor: colorOption.value }}
                                title={colorOption.label}
                            />
                        ))}
                      </div>
                    </div>
                  </>
              )}

              {/* Link to Budget or Saving Pot */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1">
                  <Link2 size={16} />
                  Link Transaction {formData.type !== 'income' && <span className="text-red-500">*</span>}
                </label>

                <div className="space-y-3">
                  {showBudgetSelector && (
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Link to Budget (Required)
                        </label>
                        <select
                            name="budgetId"
                            value={formData.budgetId || ''}
                            onChange={onFormChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
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
                          Link to Saving Pot (Required)
                        </label>
                        <select
                            name="savingPotId"
                            value={formData.savingPotId || ''}
                            onChange={onFormChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
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