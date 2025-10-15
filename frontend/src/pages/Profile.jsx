
import React, { useState } from "react";
import { User, Mail, Calendar, Shield, Camera } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement profile update API call
        console.log("Update profile:", formData);
        setIsEditing(false);
    };

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage your personal information
                </p>
            </div>

            <div className="max-w-3xl space-y-6">
                {/* Profile Picture Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 rounded-full flex items-center justify-center ring-4 ring-gray-100 dark:ring-gray-700">
                <span className="text-3xl font-medium text-white">
                  {getInitials(user?.name)}
                </span>
                            </div>
                            <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors">
                                <Camera size={16} />
                            </button>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {user?.name || "User"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {user?.email || "user@example.com"}
                            </p>
                            <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                                Upload new picture
                            </button>
                        </div>
                    </div>
                </div>

                {/* Personal Information Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Personal Information
                        </h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                            >
                                Edit
                            </button>
                        ) : null}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User
                                        size={20}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: user?.name || "",
                                            email: user?.email || "",
                                        });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {/* Name */}
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <User size={20} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Full Name
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {user?.name || "Not set"}
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Mail size={20} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Email Address
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {user?.email || "Not set"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Account Information
                    </h2>

                    <div className="space-y-4">
                        {/* Member Since */}
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <Calendar size={20} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Member Since
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    January 2025
                                </p>
                            </div>
                        </div>

                        {/* Account Type */}
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <Shield size={20} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Account Type
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Free Plan
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Your Activity
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                0
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Transactions
                            </p>
                        </div>

                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                0
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Budgets</p>
                        </div>

                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                0
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Savings Pots
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;