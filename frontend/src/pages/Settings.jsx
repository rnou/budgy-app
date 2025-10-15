import React, { useState } from "react";
import { Moon, Sun, Bell, Lock, Globe, Trash2 } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

export const Settings = () => {
    const { darkMode, toggleDarkMode } = useTheme();
    const { user } = useAuth();

    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem("budgy_notifications");
        return saved ? JSON.parse(saved) : {
            email: true,
            push: false,
            transactions: true,
            budgets: true,
        };
    });

    const [hasChanges, setHasChanges] = useState(false);

    const handleNotificationChange = (key) => {
        setNotifications((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
        setHasChanges(true);
    };

    const handleSaveChanges = () => {
        localStorage.setItem("budgy_notifications", JSON.stringify(notifications));
        setHasChanges(false);
        alert("Settings saved successfully!");
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage your account preferences
                </p>
            </div>

            <div className="max-w-3xl space-y-6">
                {/* Appearance Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Appearance
                    </h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {darkMode ? (
                                <Moon size={20} className="text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Sun size={20} className="text-gray-700 dark:text-gray-300" />
                            )}
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Dark Mode
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {darkMode ? "Switch to light theme" : "Switch to dark theme"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                darkMode ? "bg-blue-600" : "bg-gray-300"
                            }`}
                            aria-label="Toggle dark mode"
                        >
              <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
              />
                        </button>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Notifications
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {Object.entries({
                            email: "Email Notifications",
                            push: "Push Notifications",
                            transactions: "Transaction Alerts",
                            budgets: "Budget Alerts"
                        }).map(([key, label]) => (
                            <div key={key} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {key === "email" && "Receive email updates"}
                                        {key === "push" && "Receive push notifications"}
                                        {key === "transactions" && "Get notified of new transactions"}
                                        {key === "budgets" && "Alert when nearing budget limits"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleNotificationChange(key)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        notifications[key] ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                                    }`}
                                >
                  <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[key] ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                                </button>
                            </div>
                        ))}
                    </div>
                    {hasChanges && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleSaveChanges}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {/* Security Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Lock size={20} className="text-gray-700 dark:text-gray-300" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Security
                        </h2>
                    </div>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                Change Password
              </span>
                            <span className="text-gray-400">→</span>
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                Two-Factor Authentication
              </span>
                            <span className="text-gray-400">→</span>
                        </button>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Globe size={20} className="text-gray-700 dark:text-gray-300" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Preferences
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Currency
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option>USD ($)</option>
                                <option>EUR (€)</option>
                                <option>GBP (£)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Language
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-900 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Trash2 size={20} className="text-red-600 dark:text-red-500" />
                        <h2 className="text-lg font-semibold text-red-600 dark:text-red-500">
                            Danger Zone
                        </h2>
                    </div>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-between border border-red-200 dark:border-red-900">
                            <div>
                                <p className="font-medium text-red-600 dark:text-red-500">
                                    Delete Account
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Permanently delete your account and data
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;