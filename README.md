# Personal Finance Management App

A full-stack personal finance management web app built with React (Vite) on the frontend and FastAPI + SQLite on the backend.

It helps users manage multiple bank accounts, categorize spending, track monthly transactions, and visualize performance over time — with an **AI assistant** that provides intelligent financial feedback *(experimental feature)*.

---

##  Features

###  Accounts
- View all linked bank accounts
- Add new accounts or update existing ones
- Edit account names and balances instantly via the frontend
- Delete accounts (with backend checks to prevent removal if linked to transactions)

###  Categories
- Create spending categories with monthly limits (e.g., Food, Transport, Rent)
- View current financial month's categories and budgets
- Edit category name or monthly limit
- Delete unused categories

###  Transactions
- Log spending and income transactions
- Each transaction includes:
  - Account (source)
  - Category (destination)
  - Amount
  - Description
- View all transactions for the current month, grouped or filtered by category/account

###  Performance Dashboard
- Visual overview of:
  - Total spending this month
  - Remaining balance per category
  - Percent of budget spent per category
  - Monthly summary of overspending and remaining funds
- Graphs and progress bars for intuitive tracking

###  AI Financial Insights *(Experimental)*
- AI assistant analyzes your monthly spending patterns
- Provides personalized suggestions on saving and spending habits
- Built using an internal modular AI wrapper for future expansion

---

##  Tech Stack

###  Frontend
- **React (JSX + Vite)** – UI framework and development server
- **TailwindCSS** – Styling and layout
- **Lucide** – Icon system
- **Fetch API / WebSockets** – Communication with backend
- **React Hooks** – State management with optimistic updates

###  Backend
- **FastAPI** – Lightweight, asynchronous Python web framework
- **SQLite3** – Embedded database for accounts, categories, and transactions
- **Pydantic** – Data validation and serialization
- **Uvicorn** – ASGI server for production

---

##  Installation & Setup

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- (Optional) Nginx + Debian server for deployment

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS (Windows: venv\Scripts\activate)
pip install -r requirements.txt
```

Run the backend:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Default endpoints:**
- `GET /accounts/` → List all accounts
- `POST /accounts/add` → Add or update account
- `PUT /accounts/update` → Edit existing account
- `PUT /accounts/deleteAccount` → Delete account
- `GET /categories/` → View categories
- `POST /transactions/add` → Add transaction

###  Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Your app runs locally at:
```
http://127.0.0.1:5173
```

The frontend communicates with FastAPI via REST API endpoints on:
```
http://127.0.0.1:8000/
```

---

##  Deployment (Debian Example)

### 1. Build frontend
```bash
cd frontend
npm run build
```

### 2. Copy dist/ to server
```bash
scp -r dist/ user@your-server:/var/www/learnlift
```

### 3. Run FastAPI backend
```bash
nohup uvicorn main:app --host 127.0.0.1 --port 8000 &
```

### 4. Set up Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/learnlift;
    index index.html;
    try_files $uri /index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
    }
}
```

---

##  Database Schema

### `accounts`
| Column | Type | Description |
|--------|------|-------------|
| account_name | TEXT (PK) | Unique account name |
| balance | REAL | Current balance |

### `categories`
| Column | Type | Description |
|--------|------|-------------|
| category_name | TEXT (PK) | Unique category |
| monthly_limit | REAL | Spending limit per month |

### `transactions`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Transaction ID |
| date | TEXT | Date of transaction |
| month | TEXT | Financial month |
| account_name | TEXT (FK) | Related account |
| category | TEXT (FK) | Related category |
| amount | REAL | Amount spent |
| description | TEXT | Optional description |

---

##  AI Feedback Module (Preview)

> **Note:** Experimental phase — planned integration for personalized insights.

The AI component analyzes monthly spending data and generates insights such as:
- Budget risk alerts
- Category overspend detection
- Personalized saving tips

Planned to use OpenAI GPT models through a simple wrapper class.
