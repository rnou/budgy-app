import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Plus, Edit2, Trash2, Receipt, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

const RecurringBills = () => {
    const {
        recurringBills = [],
        loading,
        addRecurringBill,
        updateRecurringBill,
        deleteRecurringBill
    } = useFinance() || {};

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // all, paid, pending, overdue
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        dueDate: '',
        category: '',
        status: 'pending'
    });

    const categories = ['Bills', 'Subscriptions', 'Insurance', 'Utilities', 'Rent', 'Other'];
    const statuses = [
        { value: 'paid', label: 'Paid', color: 'green', icon: CheckCircle },
        { value: 'pending', label: 'Pending', color: 'yellow', icon: Clock },
        { value: 'overdue', label: 'Overdue', color: 'red', icon: XCircle }
    ];

    // Filter and sort bills
    const filteredBills = useMemo(() => {
        if (!Array.isArray(recurringBills)) return [];

        let filtered = recurringBills.filter(bill => bill != null);

        if (filterStatus !== 'all') {
            filtered = filtered.filter(bill => bill.status === filterStatus);
        }

        // Sort by due date
        filtered.sort((a, b) => {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return dateA - dateB;
        });

        return filtered;
    }, [recurringBills, filterStatus]);

    // Calculate totals by status
    const billStats = useMemo(() => {
        if (!Array.isArray(recurringBills)) return { total: 0, paid: 0, pending: 0, overdue: 0 };

        return {
            total: recurringBills.reduce((sum, bill) => sum + (bill?.amount || 0), 0),
            paid: recurringBills.filter(b => b?.status === 'paid').reduce((sum, bill) => sum + (bill?.amount || 0), 0),
            pending: recurringBills.filter(b => b?.status === 'pending').reduce((sum, bill) => sum + (bill?.amount || 0), 0),
            overdue: recurringBills.filter(b => b?.status === 'overdue').reduce((sum, bill) => sum + (bill?.amount || 0), 0)
        };
    }, [recurringBills]);

    const handleOpenModal = (bill = null) => {
        if (bill) {
            setEditingBill(bill);
            setFormData({
                name: bill.name,
                amount: bill.amount,
                dueDate: bill.dueDate,
                category: bill.category,
                status: bill.status
            });
        } else {
            setEditingBill(null);
            setFormData({
                name: '',
                amount: '',
                dueDate: '',
                category: '',
                status: 'pending'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBill(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingBill) {
                await updateRecurringBill(editingBill.id, {
                    ...editingBill,
                    ...formData,
                    amount: parseFloat(formData.amount)
                });
            } else {
                await addRecurringBill({
                    ...formData,
                    amount: parseFloat(formData.amount)
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving bill:', error);
            alert('Failed to save bill');
        }
    };

    const handleDelete = async (billId) => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            try {
                await deleteRecurringBill(billId);
            } catch (error) {
                console.error('Error deleting bill:', error);
                alert('Failed to delete bill');
            }
        }
    };

    const handleStatusChange = async (bill, newStatus) => {
        try {
            await updateRecurringBill(bill.id, {
                ...bill,
                status: newStatus
            });
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusConfig = (status) => {
        return statuses.find(s => s.value === status) || statuses[1];
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400">Loading bills...</div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recurring Bills</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your recurring payments
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Bill
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Bills</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${billStats.total.toFixed(2)}
                    </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-400 mb-1">Paid</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                        ${billStats.paid.toFixed(2)}
                    </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-100 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                        ${billStats.pending.toFixed(2)}
                    </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-100 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400 mb-1">Overdue</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                        ${billStats.overdue.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {['all', 'paid', 'pending', 'overdue'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 font-medium capitalize transition-colors ${
                            filterStatus === status
                                ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Bills List */}
            <div className="space-y-3">
                {filteredBills.map((bill) => {
                    const statusConfig = getStatusConfig(bill.status);
                    const StatusIcon = statusConfig.icon;
                    const daysUntil = getDaysUntilDue(bill.dueDate);

                    return (
                        <div
                            key={bill.id}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                {/* Left: Bill Info */}
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`p-3 rounded-lg bg-${statusConfig.color}-50 dark:bg-${statusConfig.color}-900/20`}>
                                        <Receipt className={`w-6 h-6 text-${statusConfig.color}-600 dark:text-${statusConfig.color}-400`} />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {bill.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                          {daysUntil >= 0 && daysUntil <= 7 && (
                              <span className="ml-1 text-orange-600 dark:text-orange-400">
                            ({daysUntil} days)
                          </span>
                          )}
                      </span>
                                            <span>•</span>
                                            <span className="capitalize">{bill.category}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle: Amount */}
                                <div className="text-right mr-6">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${bill.amount.toFixed(2)}
                                    </p>
                                </div>

                                {/* Right: Status & Actions */}
                                <div className="flex items-center gap-3">
                                    {/* Status Dropdown */}
                                    <select
                                        value={bill.status}
                                        onChange={(e) => handleStatusChange(bill, e.target.value)}
                                        className={`px-3 py-2 rounded-lg font-medium text-sm cursor-pointer transition-colors
                      ${bill.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : ''}
                      ${bill.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : ''}
                      ${bill.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ''}
                      hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400
                    `}
                                    >
                                        {statuses.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Edit Button */}
                                    <button
                                        onClick={() => handleOpenModal(bill)}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(bill.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredBills.length === 0 && (
                    <div className="text-center py-12">
                        <Receipt className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {filterStatus === 'all' ? 'No bills yet' : `No ${filterStatus} bills`}
                        </p>
                        {filterStatus === 'all' && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="mt-4 text-gray-900 dark:text-white hover:underline"
                            >
                                Add your first bill
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit Bill */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {editingBill ? 'Edit Bill' : 'Add New Bill'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Bill Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                                    placeholder="e.g., Netflix Subscription"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                                    required
                                />
                            </div>

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
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                                    required
                                >
                                    {statuses.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
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
                                    {editingBill ? 'Save Changes' : 'Add Bill'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecurringBills;