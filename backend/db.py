import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List

class BudgetTracker:
    def __init__(self, db_path='budget.db'):
        self.db_path = db_path
        self.setup_database()
    
    def setup_database(self):
        """Initialize database with required tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
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

    def financial_month(self):
        """Return the start date of the financial month"""
        now = datetime.now()
        if now.day >= 25:
            first_of_next_month = (now.replace(day=1) + timedelta(days=32)).replace(day=1)
            return first_of_next_month
        return now.replace(day=1)
    
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

    def update_account(self, old_name: str, new_name: str, new_balance: float):
        """Update an existing account name or balance, with duplicate name check"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Check if new_name already exists (and is not the same as old_name)
                cursor.execute(
                    "SELECT account_name FROM accounts WHERE account_name = ? AND account_name != ?",
                    (new_name, old_name)
                )
                if cursor.fetchone():
                    raise ValueError("Account name already exists")

                # Perform the update
                cursor.execute(
                    "UPDATE accounts SET account_name = ?, balance = ? WHERE account_name = ?",
                    (new_name, new_balance, old_name)
                )
                conn.commit()

                if cursor.rowcount == 0:
                    raise ValueError("Account not found")

        except sqlite3.Error as e:
            raise ValueError(f"Database error: {e}")

    def list_accounts(self):
        """Return all accounts as a list of dicts"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT account_name, balance FROM accounts')
            accounts = cursor.fetchall()
        return [{"name": acc[0], "amount": acc[1]} for acc in accounts]
    
    def close(self):
        """Close database connection (if persistent connections are used)"""
        pass  # No need if using 'with' statements

    def __del__(self):
        self.close()
