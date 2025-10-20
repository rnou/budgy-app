import React from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

/**
 * Reusable Confirmation Dialog Component
 *
 * @param {boolean} isOpen - Controls dialog visibility
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message/description
 * @param {string} confirmLabel - Text for confirm button (default: "Confirm")
 * @param {string} cancelLabel - Text for cancel button (default: "Cancel")
 * @param {function} onConfirm - Callback when confirmed
 * @param {function} onCancel - Callback when cancelled
 * @param {string} variant - Style variant: "danger", "warning", "info", "success" (default: "danger")
 */
const ConfirmDialog = ({
                           isOpen,
                           title = "Confirm Action",
                           message = "Are you sure you want to proceed?",
                           confirmLabel = "Confirm",
                           cancelLabel = "Cancel",
                           onConfirm,
                           onCancel,
                           variant = "danger"
                       }) => {
    if (!isOpen) return null;

    // Variant configurations
    const variants = {
        danger: {
            icon: AlertTriangle,
            iconBg: 'bg-red-100 dark:bg-red-900/20',
            iconColor: 'text-red-600 dark:text-red-400',
            buttonBg: 'bg-red-600 hover:bg-red-700',
            buttonText: 'text-white'
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-orange-100 dark:bg-orange-900/20',
            iconColor: 'text-orange-600 dark:text-orange-400',
            buttonBg: 'bg-orange-600 hover:bg-orange-700',
            buttonText: 'text-white'
        },
        info: {
            icon: Info,
            iconBg: 'bg-blue-100 dark:bg-blue-900/20',
            iconColor: 'text-blue-600 dark:text-blue-400',
            buttonBg: 'bg-blue-600 hover:bg-blue-700',
            buttonText: 'text-white'
        },
        success: {
            icon: CheckCircle,
            iconBg: 'bg-green-100 dark:bg-green-900/20',
            iconColor: 'text-green-600 dark:text-green-400',
            buttonBg: 'bg-green-600 hover:bg-green-700',
            buttonText: 'text-white'
        }
    };

    const config = variants[variant] || variants.danger;
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className={`${config.iconBg} p-3 rounded-full`}>
                            <Icon size={32} className={config.iconColor} />
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2 ${config.buttonBg} ${config.buttonText} rounded-lg transition-colors font-medium`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;