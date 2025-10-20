import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Plus, Edit2, Trash2, PiggyBank, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { THEME_COLORS } from '../constants/constants';
import ConfirmDialog from '../components/ConfirmDialog';

const SavingPots = () => {
    const {
        savingsPots = [],
        transactions = [],
        loading,
        addSavingPot,
        updateSavingPot,
        deleteSavingPot,
        addTransaction
    } = useFinance() || {};

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPot, setEditingPot] = useState(null);
    const [selectedPot, setSelectedPot] = useState(null);
    const [actionType, setActionType] = useState(null); // 'saving' or 'withdraw'
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
    const [formData, setFormData] = useState({
        name: '',
        goal: '',
        color: '#277C78'
    });
    const [actionAmount, setActionAmount] = useState('');

    // Calculate pot progress
    const potStats = useMemo(() => {
        if (!Array.isArray(savingsPots)) return [];

        return savingsPots.map(pot => {
            if (!pot) return null;

            const saved = Number(pot.saved) || 0;
            const goal = Number(pot.goal) || 1;
            const transactionCount = Number(pot.transactionCount) || 0;
            const percentage = (saved / goal) * 100;
            const remaining = goal - saved;

            return {
                ...pot,
                saved,
                goal,
                transactionCount,
                color: pot.color || '#277C78',
                percentage: Math.min(percentage, 100),
                remaining: Math.max(remaining, 0),
                isComplete: saved >= goal
            };
        }).filter(Boolean);
    }, [savingsPots]);

    // Get transactions for selected pot
    const selectedPotTransactions = useMemo(() => {
        if (!selectedPot || !Array.isArray(transactions)) return [];
        return transactions.filter(t =>
            t && t.savingPotId === selectedPot.id &&
            (t.type === 'SAVING' || t.type === 'WITHDRAW')
        );
    }, [selectedPot, transactions]);

    const handleOpenModal = (pot = null) => {
        if (pot) {
            setEditingPot(pot);
            setFormData({
                name: pot.name,
                goal: pot.goal,
                color: pot.color || '#277C78'
            });
        } else {
            setEditingPot(null);
            setFormData({ name: '', goal: '', color: '#277C78' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPot(null);
        setFormData({ name: '', goal: '', color: '#277C78' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const potData = {
                name: formData.name,
                goal: parseFloat(formData.goal),
                color: formData.color
            };

            if (editingPot) {
                await updateSavingPot(editingPot.id, potData);
            } else {
                await addSavingPot({
                    ...potData,
                    saved: 0
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving pot:', error);
            alert('Failed to save pot');
        }
    };

    const handleDeleteClick = (pot) => {
        setDeleteConfirm({
            show: true,
            id: pot.id,
            name: pot.name
        });
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteSavingPot(deleteConfirm.id);
            if (selectedPot?.id === deleteConfirm.id) {
                setSelectedPot(null);
            }
            setDeleteConfirm({ show: false, id: null, name: '' });
        } catch (error) {
            console.error('Error deleting pot:', error);
            alert('Failed to delete pot');
        }
    };

    const handleAction = async (pot, type) => {
        setSelectedPot(pot);
        setActionType(type);
        setActionAmount('');
    };

    const handleSubmitAction = async (e) => {
        e.preventDefault();

        const amount = parseFloat(actionAmount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        // Check if withdrawal exceeds saved amount
        if (actionType === 'withdraw' && amount > selectedPot.saved) {
            alert(`Cannot withdraw ${amount}. Only ${selectedPot.saved.toFixed(2)} available.`);
            return;
        }

        try {
            // Create Transaction
            await addTransaction({
                name: `${actionType === 'saving' ? 'Deposit to' : 'Withdrawal from'} ${selectedPot.name}`,
                amount: amount, // Always positive
                category: 'General',
                transactionDate: new Date().toISOString().split('T')[0],
                type: actionType,
                icon: actionType === 'saving' ? 'ArrowUpCircle' : 'ArrowDownCircle',
                color: selectedPot.color,
                savingPotId: selectedPot.id
            });

            setActionType(null);
            setActionAmount('');
        } catch (error) {
            console.error('Error processing action:', error);
            alert(error.message || 'Failed to process transaction');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400">Loading saving pots...</div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saving Pots</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Track your savings goals
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Pot
                </button>
            </div>

            {/* Total Saved Summary */}
            {potStats.length > 0 && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <PiggyBank className="w-6 h-6" />
                        <h2 className="text-lg font-semibold">Total Saved</h2>
                    </div>
                    <p className="text-4xl font-bold">
                        ${potStats.reduce((sum, pot) => sum + pot.saved, 0).toFixed(2)}
                    </p>
                    <p className="text-white/80 mt-1">
                        of ${potStats.reduce((sum, pot) => sum + pot.goal, 0).toFixed(2)} goal
                    </p>
                </div>
            )}

            {/* Pots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {potStats.map((pot) => (
                    <div
                        key={pot.id}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: pot.color }}
                                />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {pot.name}
                                </h3>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(pot)}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(pot)}
                                    className="p-1 text-gray-400 hover:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Amounts */}
                        <div className="mb-4">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Saved</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Goal</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ${pot.saved.toFixed(2)}
                                </span>
                                <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                                    ${pot.goal.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600 dark:text-gray-300">
                                    {pot.percentage.toFixed(0)}% Complete
                                </span>
                                {pot.isComplete && (
                                    <span className="text-green-600 font-semibold">✓ Goal Reached!</span>
                                )}
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                    className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
                                    style={{ width: `${pot.percentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Remaining */}
                        {!pot.isComplete && (
                            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                ${pot.remaining.toFixed(2)} left to reach goal
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => handleAction(pot, 'saving')}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm"
                            >
                                <ArrowUpCircle className="w-4 h-4" />
                                Add Money
                            </button>
                            <button
                                onClick={() => handleAction(pot, 'withdraw')}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm"
                                disabled={pot.saved === 0}
                            >
                                <ArrowDownCircle className="w-4 h-4" />
                                Withdraw
                            </button>
                        </div>

                        {/* View Details & Transaction Count */}
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => setSelectedPot(pot)}
                                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-left"
                            >
                                View {pot.transactionCount} transaction{pot.transactionCount !== 1 ? 's' : ''} →
                            </button>
                        </div>
                    </div>
                ))}

                {potStats.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <PiggyBank className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No saving pots yet</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="mt-4 text-gray-900 dark:text-white hover:underline"
                        >
                            Create your first saving pot
                        </button>
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit Pot */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {editingPot ? 'Edit Saving Pot' : 'Add New Pot'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Pot Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                                    placeholder="e.g., Vacation Fund"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Goal Amount
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.goal}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
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
                                    {editingPot ? 'Save Changes' : 'Add Pot'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Action Modal (Add Money/Withdraw) */}
            {actionType && selectedPot && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {actionType === 'saving' ? 'Add Money' : 'Withdraw Money'}
                        </h2>

                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Balance</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${selectedPot.saved.toFixed(2)}
                            </p>
                        </div>

                        <form onSubmit={handleSubmitAction} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={actionAmount}
                                    onChange={(e) => setActionAmount(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                                    placeholder="0.00"
                                    required
                                    max={actionType === 'withdraw' ? selectedPot.saved : undefined}
                                />
                                {actionType === 'withdraw' && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Maximum: ${selectedPot.saved.toFixed(2)}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionType(null);
                                        setActionAmount('');
                                        setSelectedPot(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                        actionType === 'saving'
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                >
                                    Confirm {actionType === 'saving' ? 'Deposit' : 'Withdrawal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Selected Pot Detail Modal */}
            {selectedPot && !actionType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedPot.name}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    Transaction History
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedPot(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Saved</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    ${selectedPot.saved.toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Goal</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    ${selectedPot.goal.toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Progress</p>
                                <p className="text-xl font-bold text-green-600">
                                    {((selectedPot.saved / selectedPot.goal) * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>

                        {/* Transactions */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Transactions ({selectedPotTransactions.length})
                            </h3>
                            <div className="space-y-2">
                                {selectedPotTransactions.length > 0 ? (
                                    selectedPotTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                {transaction.type === 'SAVING' ? (
                                                    <ArrowUpCircle className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <ArrowDownCircle className="w-5 h-5 text-red-600" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {transaction.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(transaction.transactionDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`font-semibold ${
                                                transaction.type === 'SAVING' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {transaction.type === 'SAVING' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.show}
                title="Delete Saving Pot"
                message={`Are you sure you want to delete "${deleteConfirm.name}"? All associated transactions will remain but won't be linked to any pot.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm({ show: false, id: null, name: '' })}
                variant="danger"
            />
        </div>
    );
};

export default SavingPots;