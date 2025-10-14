// API Service - Centralized API calls
const API_BASE_URL = "http://localhost:8080/api/v1";

// Helper to get auth token
const getAuthToken = () => localStorage.getItem("token");

// Helper to create headers
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
});

// Helper for API calls
const apiCall = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ==================== DASHBOARD ====================

export const getDashboardStats = (userId) => {
  return apiCall(`/users/${userId}/dashboard/stats`);
};

// ==================== TRANSACTIONS ====================

export const getTransactions = (userId) => {
  return apiCall(`/users/${userId}/transactions`);
};

export const getTransactionsByType = (userId, type) => {
  return apiCall(`/users/${userId}/transactions/type/${type}`);
};

export const getTransactionsByDateRange = (userId, startDate, endDate) => {
  return apiCall(
    `/users/${userId}/transactions/date-range?startDate=${startDate}&endDate=${endDate}`,
  );
};

export const createTransaction = (userId, transactionData) => {
  return apiCall(`/users/${userId}/transactions`, {
    method: "POST",
    body: JSON.stringify(transactionData),
  });
};

export const updateTransaction = (userId, transactionId, transactionData) => {
  return apiCall(`/users/${userId}/transactions/${transactionId}`, {
    method: "PUT",
    body: JSON.stringify(transactionData),
  });
};

export const deleteTransaction = (userId, transactionId) => {
  return apiCall(`/users/${userId}/transactions/${transactionId}`, {
    method: "DELETE",
  });
};

// ==================== BUDGETS ====================

export const getBudgets = (userId) => {
  return apiCall(`/users/${userId}/budgets`);
};

export const createBudget = (userId, budgetData) => {
  return apiCall(`/users/${userId}/budgets`, {
    method: "POST",
    body: JSON.stringify(budgetData),
  });
};

export const updateBudget = (userId, budgetId, budgetData) => {
  return apiCall(`/users/${userId}/budgets/${budgetId}`, {
    method: "PUT",
    body: JSON.stringify(budgetData),
  });
};

export const deleteBudget = (userId, budgetId) => {
  return apiCall(`/users/${userId}/budgets/${budgetId}`, {
    method: "DELETE",
  });
};

// ==================== SAVING POTS ====================

export const getSavingPots = (userId) => {
  return apiCall(`/users/${userId}/saving-pots`);
};

export const createSavingPot = (userId, potData) => {
  return apiCall(`/users/${userId}/saving-pots`, {
    method: "POST",
    body: JSON.stringify(potData),
  });
};

export const updateSavingPot = (userId, potId, potData) => {
  return apiCall(`/users/${userId}/saving-pots/${potId}`, {
    method: "PUT",
    body: JSON.stringify(potData),
  });
};

export const deleteSavingPot = (userId, potId) => {
  return apiCall(`/users/${userId}/saving-pots/${potId}`, {
    method: "DELETE",
  });
};

// ==================== RECURRING BILLS ====================

export const getRecurringBills = (userId) => {
  return apiCall(`/users/${userId}/recurring-bills`);
};

export const createRecurringBill = (userId, billData) => {
  return apiCall(`/users/${userId}/recurring-bills`, {
    method: "POST",
    body: JSON.stringify(billData),
  });
};

export const updateRecurringBill = (userId, billId, billData) => {
  return apiCall(`/users/${userId}/recurring-bills/${billId}`, {
    method: "PUT",
    body: JSON.stringify(billData),
  });
};

export const deleteRecurringBill = (userId, billId) => {
  return apiCall(`/users/${userId}/recurring-bills/${billId}`, {
    method: "DELETE",
  });
};
