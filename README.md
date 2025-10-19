# 💰 Budgy - Personal Finance Tracker

A modern full-stack web application for tracking income, expenses, budgets, and savings goals with real-time balance updates and visual insights.

Built with **React** + **Spring Boot** + **MySQL**.

---

## ✨ Key Features

### 💵 Financial Management
- **Real-time Balance Tracking** - Automatic balance updates with every transaction
- **Transaction Management** - Create, edit, and delete income/expenses with categorization
- **Smart Budgets** - Set spending limits per category with visual progress tracking
- **Savings Pots** - Create and track multiple savings goals with withdrawal support
- **Recurring Bills** - Manage subscription and recurring payment tracking

### 📊 Analytics & Insights
- **Dashboard Overview** - View current balance, income, expenses, and savings at a glance
- **Month-over-Month Comparisons** - Track percentage changes in spending patterns
- **Budget Alerts** - Visual indicators when budgets are exceeded
- **Recent Activity** - Quick access to latest transactions

### 🔐 Security & UX
- **JWT Authentication** - Secure login and session management
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Dark Mode Support** - Toggle between light and dark themes
- **Real-time Updates** - Instant UI refresh after data changes

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icon library
- **Context API** - State management

### Backend
- **Spring Boot 3** - REST API framework
- **Spring Security** - Authentication & authorization
- **JWT** - Token-based authentication
- **JPA/Hibernate** - ORM
- **MySQL** - Relational database
- **Lombok** - Boilerplate reduction

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- MySQL 8+

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```
Backend runs on `http://localhost:8080`

### Database Configuration
Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/budgy
spring.datasource.username=your_username
spring.datasource.password=your_password
```

---

## 📸 Screenshots


- Dashboard Overview
- Transaction Management
- Budget Tracking
- Savings Pots

---

## 🎯 Future Improvements

### Planned Features
- [ ] **Data Visualization** - Charts and graphs for spending trends
- [ ] **CSV Export** - Download transaction history
- [ ] **Budget Recommendations** - AI-powered spending insights
- [ ] **Multi-Currency Support** - Handle different currencies
- [ ] **Bill Reminders** - Email/push notifications for upcoming bills
- [ ] **Shared Budgets** - Collaborate with family members
- [ ] **Mobile App** - Native iOS/Android applications
- [ ] **Bank Integration** - Automatic transaction imports via APIs
- [ ] **Receipt Scanner** - OCR for expense documentation
- [ ] **Goal Milestones** - Celebrate savings achievements

---

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Transactions
- `GET /api/v1/users/{userId}/transactions` - Get all transactions
- `POST /api/v1/users/{userId}/transactions` - Create transaction
- `PUT /api/v1/users/{userId}/transactions/{id}` - Update transaction
- `DELETE /api/v1/users/{userId}/transactions/{id}` - Delete transaction

### Budgets
- `GET /api/v1/users/{userId}/budgets` - Get all budgets
- `POST /api/v1/users/{userId}/budgets` - Create budget
- `PUT /api/v1/users/{userId}/budgets/{id}` - Update budget
- `DELETE /api/v1/users/{userId}/budgets/{id}` - Delete budget

### Savings Pots
- `GET /api/v1/users/{userId}/saving-pots` - Get all pots
- `POST /api/v1/users/{userId}/saving-pots` - Create pot
- `PUT /api/v1/users/{userId}/saving-pots/{id}` - Update pot
- `DELETE /api/v1/users/{userId}/saving-pots/{id}` - Delete pot

### Dashboard
- `GET /api/v1/users/{userId}/dashboard/stats` - Get statistics

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Renato Leite**
- GitHub: [@rnou](https://github.com/rnou)
- LinkedIn: [renato-leite](https://www.linkedin.com/in/renato-leite-bb8a97204)

---

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI inspired by modern finance apps
- Built as a learning project for full-stack development

---

**⭐ Star this repo if you find it helpful!**