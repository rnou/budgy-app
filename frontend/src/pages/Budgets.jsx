import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import { CATEGORIES, THEME_COLORS } from '../constants/constants';

const Budgets = () => {
    const context = useFinance();

    // Safely extract values with defaults
    const budgets = context?.budgets || [];
    const transactions = context?.transactions || [];
    const loading = context?.loading || false;
    const addBudget = context?.addBudget;
    const updateBudget = context?.updateBudget;
    const deleteBudget = context?.deleteBudget;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [formData, setFormData] = useState({
        category: '',
        limitAmount: '',
        color: '#277C78'
    });

    // Calculate budget stats
    const budgetStats = useMemo(() => {
        if (!Array.isArray(budgets)) {
            return [];
        }

        return budgets
            .filter(budget => budget != null)
            .map(budget => {
                try {
                    // Use backend values directly
                    const spent = Number(budget.spent) || 0;
                    const limitAmount = Number(budget.limitAmount) || 0;
                    const transactionCount = Number(budget.transactionCount) || 0;
                    const remaining = limitAmount - spent;
                    const percentage = limitAmount > 0 ? (spent / limitAmount) * 100 : 0;

                    return {
                        id: budget.id,
                        category: budget.category || 'Unknown',
                        limitAmount: limitAmount,
                        color: budget.color || '#277C78',
                        spent: spent,
                        remaining: remaining,
                        percentage: Math.min(Math.max(percentage, 0), 100),
                        transactionCount: transactionCount,
                        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
                    };
                } catch (error) {
                    console.error('Error calculating budget stats:', error);
                    return null;
                }
            })
            .filter(stat => stat != null);
    }, [budgets]);

    // Get transactions for selected budget
    const selectedBudgetTransactions = useMemo(() => {
        if (!selectedBudget || !Array.isArray(transactions)) {
            return [];
        }
        return transactions.filter(t => t != null && t.budgetId === selectedBudget.id);
    }, [selectedBudget, transactions]);

    const handleOpenModal = (budget = null) => {
        if (budget) {
            setEditingBudget(budget);
            setFormData({
                category: budget.category || '',
                limitAmount: budget.limitAmount || '',
                color: budget.color || '#277C78'
            });
        } else {
            setEditingBudget(null);
            setFormData({ category: '', limitAmount: '', color: '#277C78' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBudget(null);
        setFormData({ category: '', limitAmount: '', color: '#277C78' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!addBudget || !updateBudget) {
            alert('Budget functions not available. Please check your setup.');
            return;
        }

        try {
            const budgetData = {
                category: formData.category,
                limitAmount: parseFloat(formData.limitAmount) || 0,
                color: formData.color
            };

            if (editingBudget) {
                await updateBudget(editingBudget.id, budgetData);
            } else {
                await addBudget(budgetData);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving budget:', error);
            alert('Failed to save budget: ' + error.message);
        }
    };

    const handleDelete = async (budgetId) => {
        if (!deleteBudget) {
            alert('Delete function not available.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                await deleteBudget(budgetId);
                if (selectedBudget?.id === budgetId) {
                    setSelectedBudget(null);
                }
            } catch (error) {
                console.error('Error deleting budget:', error);
                alert('Failed to delete budget: ' + error.message);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'exceeded': return 'text-red-600';
            case 'warning': return 'text-orange-600';
            default: return 'text-green-600';
        }
    };

    const formatCurrency = (amount) => {
        const num = Number(amount) || 0;
        return num.toFixed(2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400">Loading budgets...</div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your spending limits
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Budget
                </button>
            </div>

            {/* Budget Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgetStats.map((budget) => (
                    <div
                        key={budget.id}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedBudget(budget)}
                    >
                        {/* Category and Actions */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: budget.color }}
                                />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {budget.category}
                                </h3>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModal(budget);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(budget.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Budget Amount */}
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Maximum</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${formatCurrency(budget.limitAmount)}
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600 dark:text-gray-300">Spent</span>
                                <span className={`font-semibold ${getStatusColor(budget.status)}`}>
                                  ${formatCurrency(budget.spent)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${
                                        budget.status === 'exceeded' ? 'bg-red-600' :
                                            budget.status === 'warning' ? 'bg-orange-500' :
                                                'bg-green-500'
                                    }`}
                                    style={{ width: `${budget.percentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Remaining */}
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Remaining</span>
                            <span className={`font-semibold ${
                                budget.remaining < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                            }`}>
                                ${formatCurrency(Math.abs(budget.remaining))}
                                {budget.remaining < 0 && ' over'}
                            </span>
                        </div>

                        {/* Transaction Count */}
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {budget.transactionCount} transaction{budget.transactionCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                ))}

                {budgetStats.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No budgets yet</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="mt-4 text-gray-900 dark:text-white hover:underline"
                        >
                            Create your first budget
                        </button>
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit Budget */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {editingBudget ? 'Edit Budget' : 'Add New Budget'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                                    required
                                >
                                    <option value="">Select category</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Maximum Amount
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.limitAmount}
                                    onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Theme Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {THEME_COLORS.map((colorOption) => (
                                        <button
                                            key={colorOption.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: colorOption.value })}
                                            className={`w-10 h-10 rounded-lg transition-transform ${
                                                formData.color === colorOption.value ? 'ring-2 ring-gray-900 dark:ring-white scale-110' : ''
                                            }`}
                                            style={{ backgroundColor: colorOption.value }}
                                            title={colorOption.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                                >
                                    {editingBudget ? 'Save Changes' : 'Add Budget'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Selected Budget Detail Modal */}
            {selectedBudget && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedBudget.category}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    Budget Details & Transactions
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedBudget(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Maximum</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    ${formatCurrency(selectedBudget.limitAmount)}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Spent</p>
                                <p className="text-xl font-bold text-red-600">
                                    ${formatCurrency(selectedBudget.spent)}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
                                <p className={`text-xl font-bold ${
                                    selectedBudget.remaining < 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    ${formatCurrency(Math.abs(selectedBudget.remaining))}
                                </p>
                            </div>
                        </div>

                        {/* Transactions */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Transactions ({selectedBudgetTransactions.length})
                            </h3>
                            <div className="space-y-2">
                                {selectedBudgetTransactions.length > 0 ? (
                                    selectedBudgetTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {transaction.name || 'Unknown'}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleDateString() : 'No date'}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-red-600">
                                                -${formatCurrency(Math.abs(transaction.amount))}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No transactions yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;