import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense',
    date: ''
  });
  const [editingId, setEditingId] = useState(null);

  // GET - Fetch all transactions
  useEffect(() => {
    fetch(`${API_URL}/transactions`)
      .then(res => res.json())
      .then(data => {
        console.log('Transactions loaded:', data);
        setTransactions(data);
      })
      .catch(error => {
        console.error('Error fetching transactions:', error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // POST - Create new transaction
  const handleSubmit = () => {
    if (!formData.amount || !formData.description || !formData.category || !formData.date) {
      return;
    }

    const transactionData = {
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      type: formData.type,
      date: formData.date
    };

    if (editingId) {
      // PUT - Update existing transaction
      fetch(`${API_URL}/transactions/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      })
      .then(res => res.json())
      .then(data => {
        console.log('Transaction updated:', data);
        setTransactions(transactions.map(t => t.id === editingId ? data : t));
        resetForm();
      })
      .catch(error => {
        console.error('Error updating transaction:', error);
      });
    } else {
      // POST - Create new transaction
      fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      })
      .then(res => res.json())
      .then(data => {
        console.log('Transaction created:', data);
        setTransactions([...transactions, data]);
        resetForm();
      })
      .catch(error => {
        console.error('Error creating transaction:', error);
      });
    }
  };

  // DELETE - Remove transaction
  const handleDelete = (id) => {
    fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE'
    })
    .then(() => {
      console.log('Transaction deleted:', id);
      setTransactions(transactions.filter(t => t.id !== id));
    })
    .catch(error => {
      console.error('Error deleting transaction:', error);
    });
  };

  const handleEdit = (transaction) => {
    setFormData({
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date
    });
    setEditingId(transaction.id);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      category: '',
      type: 'expense',
      date: ''
    });
    setEditingId(null);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div>
      <h1>Transaction Manager</h1>
      
      <div>
        <h2>Summary</h2>
        <div>Income: ${totalIncome.toFixed(2)}</div>
        <div>Expenses: ${totalExpenses.toFixed(2)}</div>
        <div>Balance: ${balance.toFixed(2)}</div>
      </div>

      <div>
        <h2>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</h2>
        
        <div>
          <label>Amount:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label>Description:</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label>Type:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        
        <div>
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <button onClick={handleSubmit}>
          {editingId ? 'Update Transaction' : 'Add Transaction'}
        </button>
        
        {editingId && (
          <button onClick={resetForm}>Cancel</button>
        )}
      </div>

      <div>
        <h2>Transactions ({transactions.length})</h2>
        
        {transactions.length === 0 && (
          <div>No transactions found. Add some transactions to get started!</div>
        )}
        
        {transactions.map(transaction => (
          <div key={transaction.id}>
            <div>
              <strong>${transaction.amount.toFixed(2)}</strong> - {transaction.description}
            </div>
            <div>
              Category: {transaction.category} | Type: {transaction.type} | Date: {transaction.date}
            </div>
            <div>
              <button onClick={() => handleEdit(transaction)}>Edit</button>
              <button onClick={() => handleDelete(transaction.id)}>Delete</button>
            </div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;