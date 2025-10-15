import React, { useState, useMemo, useCallback } from "react";
import { Plus, Search, Filter, Edit2, Trash2, ShoppingBag } from "lucide-react";
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
};

export const Transactions = () => {
  const {
    transactions = [],
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

      const matchesType =
          filters.filterType === FILTER_TYPES.ALL ||
          transaction.type === filters.filterType;

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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      type: transaction.type || "expense",
      icon: transaction.icon || "ShoppingBag",
      color: transaction.color || "bg-blue-500",
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
      const transactionData = {
        ...formData,
        amount:
            parseFloat(formData.amount) * (formData.type === "expense" ? -1 : 1),
        transactionDate: new Date().toISOString().split('T')[0],
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

  const renderTransaction = useCallback(
      (transaction) => {
        if (!transaction) return null;

        const { id, icon, color, name, category, date, amount } = transaction;
        const Icon = ICON_MAP[icon] || ShoppingBag;
        const isPositive = Number(amount) > 0;

        return (
            <div key={id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div
                      className={`w-12 h-12 rounded-full ${color || "bg-gray-500"} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {name || "Unknown"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {category || "other"} • {formatDate(date)}
                    </p>
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
      [openEditModal, handleDelete],
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
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
                            onFormChange,
                            onSubmit,
                            onClose,
                          }) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isEditing ? "Edit Transaction" : "Add New Transaction"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
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
                </select>
              </div>

              {/* Category */}
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

              {/* Icon */}
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

              {/* Color */}
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
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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