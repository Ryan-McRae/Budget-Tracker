import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class BudgetTracker:
    def __init__(self, db_path='budget.db'):
        self.db_path = db_path
        self.setup_database()

#   DATABASE SETUP
    def setup_database(self):
        """Initialize database with required tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Settings table for user preferences
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )
            ''')
            
            # Set default financial month start day if not exists
            cursor.execute('''
                INSERT OR IGNORE INTO settings (key, value) VALUES ('financial_month_start_day', '25')
            ''')
            
            # Bank accounts table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS accounts (
                    account_name TEXT PRIMARY KEY,
                    balance REAL NOT NULL
                )
            ''')
            
            # Budget categories table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS categories (
                    category_name TEXT PRIMARY KEY,
                    monthly_limit REAL NOT NULL
                )
            ''')
            
            # Transactions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    month TEXT NOT NULL,
                    account_name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    amount REAL NOT NULL,
                    description TEXT,
                    FOREIGN KEY (account_name) REFERENCES accounts(account_name),
                    FOREIGN KEY (category) REFERENCES categories(category_name)
                )
            ''')
            conn.commit()

#   SETTINGS MANAGEMENT
    def get_financial_month_start_day(self) -> int:
        """Get the user's financial month start day"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT value FROM settings WHERE key = ?', ('financial_month_start_day',))
            result = cursor.fetchone()
            return int(result[0]) if result else 25

    def set_financial_month_start_day(self, day: int):
        """Set the user's financial month start day (1-28)"""
        if not 1 <= day <= 28:
            raise ValueError("Financial month start day must be between 1 and 28")
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO settings (key, value) VALUES ('financial_month_start_day', ?)
            ''', (str(day),))
            conn.commit()

#   DETERMINE FINANCIAL MONTH
    def financial_month(self, date: Optional[datetime] = None) -> str:
        """Return the YYYY-MM financial month for a given date based on user's start day"""
        if date is None:
            date = datetime.now()
        
        start_day = self.get_financial_month_start_day()
        
        if date.day >= start_day:
            # Current date is on or after start day, so we're in the "next" financial month
            # Roll forward to next calendar month
            fm = (date.replace(day=1) + timedelta(days=32)).replace(day=1).strftime("%Y-%m")
        else:
            # Current date is before start day, so we're still in current calendar month's financial period
            fm = date.strftime("%Y-%m")
        
        return fm

    def get_financial_month_dates(self, date: Optional[datetime] = None) -> Dict[str, datetime]:
        """Get the start and end dates of the current financial month"""
        if date is None:
            date = datetime.now()
        
        start_day = self.get_financial_month_start_day()
        
        if date.day >= start_day:
            # Financial month started this calendar month
            start_date = date.replace(day=start_day, hour=0, minute=0, second=0, microsecond=0)
            # End date is start_day - 1 of next calendar month
            next_month = (date.replace(day=1) + timedelta(days=32)).replace(day=1)
            end_date = next_month.replace(day=start_day - 1, hour=23, minute=59, second=59)
        else:
            # Financial month started last calendar month
            prev_month = (date.replace(day=1) - timedelta(days=1))
            start_date = prev_month.replace(day=start_day, hour=0, minute=0, second=0, microsecond=0)
            end_date = date.replace(day=start_day - 1, hour=23, minute=59, second=59)
        
        return {
            'start': start_date,
            'end': end_date
        }

    def days_remaining_in_financial_month(self, date: Optional[datetime] = None) -> int:
        """Calculate days remaining in the current financial month"""
        if date is None:
            date = datetime.now()
        
        dates = self.get_financial_month_dates(date)
        end_date = dates['end']
        
        # Calculate days remaining
        remaining = (end_date - date).days + 1  # +1 to include today
        return max(0, remaining)

    def get_performance_data(self) -> Dict:
        """Get comprehensive performance data for the current financial month"""
        current_month = self.financial_month()
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get categories with spending
            cursor.execute('SELECT category_name, monthly_limit FROM categories')
            categories = cursor.fetchall()
            
            cursor.execute('''
                SELECT category, SUM(amount) as spent
                FROM transactions
                WHERE month = ?
                GROUP BY category
            ''', (current_month,))
            spending = dict(cursor.fetchall())
            
            # Get last month's total spending
            last_month_date = datetime.now() - timedelta(days=35)
            last_month_str = self.financial_month(last_month_date)
            
            cursor.execute('''
                SELECT SUM(amount) FROM transactions WHERE month = ?
            ''', (last_month_str,))
            last_month_result = cursor.fetchone()
            last_month_spent = last_month_result[0] if last_month_result[0] else 0
            
            # Calculate totals
            total_budget = sum(cat[1] for cat in categories)
            total_spent = sum(spending.values())
            
            # Build category details
            category_details = [
                {
                    "name": cat[0],
                    "limit": cat[1],
                    "spent": spending.get(cat[0], 0)
                }
                for cat in categories
            ]
            
            return {
                "totalBudget": total_budget,
                "totalSpent": total_spent,
                "categories": category_details,
                "daysRemaining": self.days_remaining_in_financial_month(),
                "lastMonthSpent": last_month_spent,
                "financialMonthStartDay": self.get_financial_month_start_day(),
                "currentFinancialMonth": current_month
            }

#   Deleting accounts
    def delete_account(self, account_name: str):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT COUNT(*) FROM transactions WHERE account_name = ?', (account_name,))
                count = cursor.fetchone()[0]
                if count == 0:
                    cursor.execute('DELETE FROM accounts WHERE account_name = ?', (account_name,))
                else:
                    raise ValueError("Account has transactions")
                conn.commit()
        except sqlite3.Error as e:
            raise ValueError(f"Database error: {e}")        

#   UPDATING ACCOUNTS
    def update_account(self, old_name: str, new_name: str, new_balance: float):
        """Update an existing account name or balance, with duplicate name check"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT account_name FROM accounts WHERE account_name = ? AND account_name != ?",
                    (new_name, old_name)
                )
                if cursor.fetchone():
                    raise ValueError("Account name already exists")

                cursor.execute(
                    "UPDATE accounts SET account_name = ?, balance = ? WHERE account_name = ?",
                    (new_name, new_balance, old_name)
                )
                conn.commit()

                if cursor.rowcount == 0:
                    raise ValueError("Account not found")
        except sqlite3.Error as e:
            raise ValueError(f"Database error: {e}")

#   ADDING ACCOUNTS
    def add_account(self, account_name: str, account_balance: float):
        """Add an account, with duplicate name check""" 
        account_name = account_name.strip()
        if account_name == "":
            raise ValueError("Account name cannot be empty.")
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT account_name FROM accounts WHERE account_name = ?",
                    (account_name,)
                )
                if cursor.fetchone():
                    raise ValueError("Account already exists")

                cursor.execute('''
                    INSERT INTO accounts (account_name, balance) VALUES (?, ?)
                ''', (account_name, account_balance))
                conn.commit()
        except sqlite3.Error as e:
            raise ValueError(f"Database error: {e}")

#   LISTING ACCOUNTS
    def list_accounts(self):
        """Return all accounts as a list of dicts"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT account_name, balance FROM accounts')
            accounts = cursor.fetchall()
        return [{"name": acc[0], "amount": acc[1]} for acc in accounts]

#   LISTING CATEGORIES
    def list_categories(self):
        """List all existing categories with current month spending"""
        month = self.financial_month()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT category_name, monthly_limit FROM categories')
            categories = cursor.fetchall()
            cursor.execute('''
                SELECT category, SUM(amount) as spent
                FROM transactions
                WHERE month = ?
                GROUP BY category
            ''', (month,))
            spending = dict(cursor.fetchall())
        return [{"name": cat[0], "limit": cat[1], "spent": spending.get(cat[0], 0)} for cat in categories]

#   ADDING CATEGORIES
    def add_category(self, category_name: str, category_limit: float):
        """Add a budget category with spending limit"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT category_name FROM categories WHERE category_name = ?",
                    (category_name,)
                )
                if cursor.fetchone():
                    raise ValueError("Category name already exists")

                cursor.execute(
                    "INSERT INTO categories (category_name, monthly_limit) VALUES (?, ?)",
                    (category_name, category_limit)
                )
                conn.commit()
        except sqlite3.Error as e:
            raise ValueError(f"Database error: {e}")

#   DELETING CATEGORIES 
    def delete_category(self, category_name: str):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT 1 FROM categories WHERE category_name = ?', (category_name,))
                if not cursor.fetchone():
                    raise ValueError("Category does not exist")

                cursor.execute('SELECT COUNT(*) FROM transactions WHERE category = ?', (category_name,))
                count = cursor.fetchone()[0]
                if count > 0:
                    raise ValueError("Category has transactions")

                cursor.execute('DELETE FROM categories WHERE category_name = ?', (category_name,))
                conn.commit()
        except sqlite3.Error as e:
            raise ValueError(f"Database error: {e}")

#   UPDATING CATEGORIES
    def update_category(self, cat_name: str, new_limit: float):
        """Update an existing category limit"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT OR REPLACE INTO categories (category_name, monthly_limit) VALUES (?, ?)",
                    (cat_name, new_limit)
                )
                conn.commit()
        except sqlite3.Error as e:
            raise ValueError(f"Database error: {e}")

#   RECORDING TRANSACTIONS
    def record_transaction(self, account_name: str, category: str, amount: float, description: str):
        """Record a transaction and update account balance"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                now = datetime.now()
                date_str = now.strftime('%Y-%m-%d %H:%M:%S')
                month_str = self.financial_month(now)  # Use financial month
        
                cursor.execute('''
                    INSERT INTO transactions (date, month, account_name, category, amount, description)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (date_str, month_str, account_name, category, amount, description))
        
                cursor.execute('''
                    UPDATE accounts SET balance = balance - ? WHERE account_name = ?
                ''', (amount, account_name))

                conn.commit()
        except sqlite3.Error as e:
            raise ValueError(f"Database error: {e}")

    def close(self):
        """Close database connection (if persistent connections are used)"""
        pass

    def __del__(self):
        self.close()