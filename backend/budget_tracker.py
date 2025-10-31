import sqlite3
import os
from datetime import datetime
from typing import Dict, List, Tuple

def clear_screen():
    os.system('clear' if os.name != 'nt' else 'cls')

class BudgetTracker:
    def __init__(self, db_path='budget.db'):
        self.db_path = db_path
        self.conn = None
        self.setup_database()
    
    def setup_database(self):
        """Initialize database with required tables"""
        self.conn = sqlite3.connect(self.db_path)
        cursor = self.conn.cursor()
        
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
        
        self.conn.commit()
    
    def list_accounts(self):
        """List all existing accounts"""
        cursor = self.conn.cursor()
        cursor.execute('SELECT account_name, balance FROM accounts')
        accounts = cursor.fetchall()
        return accounts
    
    def add_account(self, account_name: str, initial_balance: float):
        """Add or update a bank account"""
        cursor = self.conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO accounts (account_name, balance)
            VALUES (?, ?)
        ''', (account_name, initial_balance))
        self.conn.commit()
        print(f"✓ Account '{account_name}' set with balance: R{initial_balance:.2f}")
    
    def list_categories(self):
        """List all existing categories"""
        cursor = self.conn.cursor()
        cursor.execute('SELECT category_name, monthly_limit FROM categories')
        categories = cursor.fetchall()
        return categories
    
    def add_category(self, category_name: str, monthly_limit: float):
        """Add or update a budget category with spending limit"""
        cursor = self.conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO categories (category_name, monthly_limit)
            VALUES (?, ?)
        ''', (category_name, monthly_limit))
        self.conn.commit()
        print(f"✓ Category '{category_name}' set with monthly limit: R{monthly_limit:.2f}")
    
    def add_expense(self, account_name: str, category: str, amount: float, description: str = ""):
        """Record a new expense"""
        cursor = self.conn.cursor()
        
        # Check if account exists
        cursor.execute('SELECT balance FROM accounts WHERE account_name = ?', (account_name,))
        account = cursor.fetchone()
        if not account:
            print(f"✗ Account '{account_name}' not found. Please add it first.")
            return
        
        # Check if category exists
        cursor.execute('SELECT category_name FROM categories WHERE category_name = ?', (category,))
        if not cursor.fetchone():
            print(f"✗ Category '{category}' not found. Please add it first.")
            return
        
        # Add transaction
        now = datetime.now()
        date_str = now.strftime('%Y-%m-%d %H:%M:%S')
        month_str = now.strftime('%Y-%m')
        
        cursor.execute('''
            INSERT INTO transactions (date, month, account_name, category, amount, description)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (date_str, month_str, account_name, category, amount, description))
        
        # Update account balance
        cursor.execute('''
            UPDATE accounts SET balance = balance - ? WHERE account_name = ?
        ''', (amount, account_name))
        
        self.conn.commit()
        print(f"✓ Expense recorded: R{amount:.2f} from {account_name} for {category}")
    
    def view_accounts(self):
        """Display all bank accounts and their balances"""
        cursor = self.conn.cursor()
        cursor.execute('SELECT account_name, balance FROM accounts')
        accounts = cursor.fetchall()
        
        if not accounts:
            print("No accounts found.")
            return
        
        print("\n" + "="*50)
        print("BANK ACCOUNTS")
        print("="*50)
        total = 0
        for name, balance in accounts:
            print(f"{name:20s} R{balance:10.2f}")
            total += balance
        print("-"*50)
        print(f"{'TOTAL':20s} R{total:10.2f}")
        print("="*50 + "\n")
    
    def monthly_overview(self, month: str = None):
        """Display comprehensive monthly budget overview"""
        if month is None:
            month = datetime.now().strftime('%Y-%m')
        
        cursor = self.conn.cursor()
        
        # Get category spending
        cursor.execute('''
            SELECT category, SUM(amount) as spent
            FROM transactions
            WHERE month = ?
            GROUP BY category
        ''', (month,))
        spending = dict(cursor.fetchall())
        
        # Get all categories with limits
        cursor.execute('SELECT category_name, monthly_limit FROM categories')
        categories = cursor.fetchall()
        
        if not categories:
            print("No categories set up yet.")
            return
        
        print("\n" + "="*70)
        print(f"MONTHLY BUDGET OVERVIEW - {month}")
        print("="*70)
        print(f"{'Category':<15} {'Limit':>10} {'Spent':>10} {'Left':>10} {'% Used':>10}")
        print("-"*70)
        
        total_limit = 0
        total_spent_all = 0
        
        for cat_name, limit in categories:
            spent = spending.get(cat_name, 0)
            left = limit - spent
            percent = (spent / limit * 100) if limit > 0 else 0
            
            print(f"{cat_name:<15} R{limit:>9.2f} R{spent:>9.2f} R{left:>9.2f} {percent:>9.1f}%")
            total_limit += limit
            total_spent_all += spent
        
        print("-"*70)
        overall_percent = (total_spent_all / total_limit * 100) if total_limit > 0 else 0
        print(f"{'TOTAL':<15} R{total_limit:>9.2f} R{total_spent_all:>9.2f} R{total_limit - total_spent_all:>9.2f} {overall_percent:>9.1f}%")
        print("="*70)
        
        # Account balances
        self.view_accounts()
    
    def view_monthly_log(self, month: str = None):
        """View all transactions for a specific month"""
        if month is None:
            month = datetime.now().strftime('%Y-%m')
        
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT id, date, account_name, category, amount, description
            FROM transactions
            WHERE month = ?
            ORDER BY date DESC
        ''', (month,))
        transactions = cursor.fetchall()
        
        if not transactions:
            print(f"No transactions found for {month}")
            return
        
        print("\n" + "="*90)
        print(f"TRANSACTION LOG - {month}")
        print("="*90)
        print(f"{'ID':<5} {'Date':<20} {'Account':<12} {'Category':<12} {'Amount':>10} {'Description':<15}")
        print("-"*90)
        
        for tid, date, account, category, amount, desc in transactions:
            print(f"{tid:<5} {date:<20} {account:<12} {category:<12} R{amount:>9.2f} {desc:<15}")
        
        print("="*90 + "\n")
    
    def category_analysis(self, category: str, month: str = None):
        """Analyze spending in a specific category"""
        if month is None:
            month = datetime.now().strftime('%Y-%m')
        
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT id, date, account_name, amount, description
            FROM transactions
            WHERE category = ? AND month = ?
            ORDER BY date DESC
        ''', (category, month))
        transactions = cursor.fetchall()
        
        if not transactions:
            print(f"No transactions in '{category}' for {month}")
            return
        
        cursor.execute('SELECT monthly_limit FROM categories WHERE category_name = ?', (category,))
        limit = cursor.fetchone()
        
        total = sum(t[3] for t in transactions)
        
        print("\n" + "="*80)
        print(f"CATEGORY ANALYSIS: {category} - {month}")
        print("="*80)
        if limit:
            print(f"Monthly Limit: R{limit[0]:.2f}")
            print(f"Total Spent: R{total:.2f}")
            print(f"Remaining: R{limit[0] - total:.2f}")
            print(f"Percentage Used: {(total/limit[0]*100):.1f}%")
        else:
            print(f"Total Spent: R{total:.2f}")
        print("-"*80)
        print(f"{'ID':<5} {'Date':<20} {'Account':<15} {'Amount':>10} {'Description'}")
        print("-"*80)
        
        for tid, date, account, amount, desc in transactions:
            print(f"{tid:<5} {date:<20} {account:<15} R{amount:>9.2f} {desc}")
        
        print("="*80 + "\n")
    
    def delete_transaction(self, transaction_id: int):
        """Delete a transaction and restore the account balance"""
        cursor = self.conn.cursor()
        
        # Get transaction details before deleting
        cursor.execute('''
            SELECT account_name, amount FROM transactions WHERE id = ?
        ''', (transaction_id,))
        transaction = cursor.fetchone()
        
        if not transaction:
            print(f"✗ Transaction ID {transaction_id} not found.")
            return False
        
        account_name, amount = transaction
        
        # Delete the transaction
        cursor.execute('DELETE FROM transactions WHERE id = ?', (transaction_id,))
        
        # Restore the amount to the account
        cursor.execute('''
            UPDATE accounts SET balance = balance + ? WHERE account_name = ?
        ''', (amount, account_name))
        
        self.conn.commit()
        print(f"✓ Transaction ID {transaction_id} deleted and R{amount:.2f} restored to {account_name}")
        return True
    
    def delete_account(self, account_name: str):
        """Delete a bank account"""
        cursor = self.conn.cursor()
        
        # Check if account has transactions
        cursor.execute('SELECT COUNT(*) FROM transactions WHERE account_name = ?', (account_name,))
        count = cursor.fetchone()[0]
        
        if count > 0:
            print(f"✗ Cannot delete '{account_name}'. It has {count} transaction(s).")
            print("  Delete the transactions first or keep the account.")
            return False
        
        cursor.execute('DELETE FROM accounts WHERE account_name = ?', (account_name,))
        self.conn.commit()
        
        if cursor.rowcount > 0:
            print(f"✓ Account '{account_name}' deleted successfully.")
            return True
        else:
            print(f"✗ Account '{account_name}' not found.")
            return False
    
    def delete_category(self, category_name: str):
        """Delete a category"""
        cursor = self.conn.cursor()
        
        # Check if category has transactions
        cursor.execute('SELECT COUNT(*) FROM transactions WHERE category = ?', (category_name,))
        count = cursor.fetchone()[0]
        
        if count > 0:
            print(f"✗ Cannot delete '{category_name}'. It has {count} transaction(s).")
            print("  Delete the transactions first or keep the category.")
            return False
        
        cursor.execute('DELETE FROM categories WHERE category_name = ?', (category_name,))
        self.conn.commit()
        
        if cursor.rowcount > 0:
            print(f"✓ Category '{category_name}' deleted successfully.")
            return True
        else:
            print(f"✗ Category '{category_name}' not found.")
            return False
    
    def view_recent_transactions(self, limit: int = 20):
        """View recent transactions with IDs"""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT id, date, account_name, category, amount, description
            FROM transactions
            ORDER BY date DESC
            LIMIT ?
        ''', (limit,))
        transactions = cursor.fetchall()
        
        if not transactions:
            print("No transactions found.")
            return
        
        print("\n" + "="*90)
        print("RECENT TRANSACTIONS")
        print("="*90)
        print(f"{'ID':<5} {'Date':<20} {'Account':<12} {'Category':<12} {'Amount':>10} {'Description':<15}")
        print("-"*90)
        
        for tid, date, account, category, amount, desc in transactions:
            print(f"{tid:<5} {date:<20} {account:<12} {category:<12} R{amount:>9.2f} {desc:<15}")
        
        print("="*90 + "\n")
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()


def main():
    tracker = BudgetTracker()
    
    while True:
        clear_screen()
        print("\n" + "="*50)
        print("BUDGET TRACKER")
        print("="*50)
        print("1. Add/Update Bank Account")
        print("2. Add/Update Category")
        print("3. Record Expense")
        print("4. View Bank Accounts")
        print("5. Monthly Overview")
        print("6. View Monthly Transaction Log")
        print("7. Analyze Category")
        print("8. Delete Transaction")
        print("9. Delete Account")
        print("10. Delete Category")
        print("11. Exit")
        print("="*50)
        
        choice = input("\nSelect option: ").strip()
        
        
        if choice == '1':
            clear_screen()
            # Show existing accounts
            accounts = tracker.list_accounts()
            if accounts:
                print("\n" + "="*50)
                print("EXISTING ACCOUNTS")
                print("="*50)
                for i, (name, balance) in enumerate(accounts, 1):
                    print(f"  {i}. {name:<20s} Balance: R{balance:>10.2f}")
                print("="*50 + "\n")
            
            name = input("Account name: ").strip()
            balance = float(input("Current balance: ").strip())
            tracker.add_account(name, balance)
            input("\nPress Enter to continue...")
        
        elif choice == '2':
            clear_screen()
            # Show existing categories
            categories = tracker.list_categories()
            if categories:
                print("\n" + "="*50)
                print("EXISTING CATEGORIES")
                print("="*50)
                for i, (name, limit) in enumerate(categories, 1):
                    print(f"  {i}. {name:<20s} Limit: R{limit:>10.2f}/month")
                print("="*50 + "\n")
            
            name = input("Category name (e.g., food, entertainment, petrol, savings): ").strip()
            limit = float(input("Monthly spending limit: ").strip())
            tracker.add_category(name, limit)
            input("\nPress Enter to continue...")
        
        elif choice == '3':
            clear_screen()
            while True:
                
                # Show existing accounts and categories
                accounts = tracker.list_accounts()
                categories = tracker.list_categories()
                
                if accounts:
                    print("\n" + "="*50)
                    print("AVAILABLE ACCOUNTS")
                    print("="*50)
                    for i, (name, balance) in enumerate(accounts, 1):
                        print(f"  {i}. {name:<20s} Balance: R{balance:>10.2f}")
                    print("="*50)
                else:
                    print("\n⚠ No accounts found. Please add an account first (option 1).")
                    input("\nPress Enter to continue...")
                    break
                
                if categories:
                    print("\n" + "="*50)
                    print("AVAILABLE CATEGORIES")
                    print("="*50)
                    for i, (name, limit) in enumerate(categories, 1):
                        print(f"  {i}. {name}")
                    print("="*50 + "\n")
                else:
                    print("\n⚠ No categories found. Please add a category first (option 2).")
                    input("\nPress Enter to continue...")
                    break
                
                print("(Type 'exit' in any field to return to main menu)\n")
                
                account = input("Account name: ").strip()
                if account.lower() == 'exit':
                    break
                
                category = input("Category: ").strip()
                if category.lower() == 'exit':
                    break
                
                amount_input = input("Amount: ").strip()
                if amount_input.lower() == 'exit':
                    break
                
                try:
                    amount = float(amount_input)
                except ValueError:
                    print("Invalid amount. Please try again.")
                    input("\nPress Enter to continue...")
                    continue
                
                desc = input("Description (optional): ").strip()
                if desc.lower() == 'exit':
                    break
                
                tracker.add_expense(account, category, amount, desc)
                print("\n✓ Expense added! Add another or type 'exit' to return.")
                input("\nPress Enter to add another expense...")

        
        elif choice == '4':
            clear_screen()
            tracker.view_accounts()
            input("\nPress Enter to continue...")
        
        elif choice == '5':
            clear_screen()
            month = input("Month (YYYY-MM, or press Enter for current month): ").strip()
    
            tracker.monthly_overview(month if month else None)
            input("\nPress Enter to continue...")
        
        elif choice == '6':
            clear_screen()
            month = input("Month (YYYY-MM, or press Enter for current month): ").strip()
         
            tracker.view_monthly_log(month if month else None)
            input("\nPress Enter to continue...")
        
        elif choice == '7':
            clear_screen()
            category = input("Category name: ").strip()
            month = input("Month (YYYY-MM, or press Enter for current month): ").strip()
           
            tracker.category_analysis(category, month if month else None)
            input("\nPress Enter to continue...")
        
        elif choice == '8':
            clear_screen()
            tracker.view_recent_transactions(30)
            
            transaction_id = input("Enter transaction ID to delete (or press Enter to cancel): ").strip()
            if transaction_id:
                try:
                    tracker.delete_transaction(int(transaction_id))
                except ValueError:
                    print("Invalid ID. Please enter a number.")
            
            input("\nPress Enter to continue...")
        
        elif choice == '9':
            clear_screen()
            accounts = tracker.list_accounts()
            if accounts:
                print("\n" + "="*50)
                print("EXISTING ACCOUNTS")
                print("="*50)
                for i, (name, balance) in enumerate(accounts, 1):
                    print(f"  {i}. {name:<20s} Balance: R{balance:>10.2f}")
                print("="*50 + "\n")
            else:
                print("No accounts to delete.")
                input("\nPress Enter to continue...")
                continue
            
            account_name = input("Enter account name to delete (or press Enter to cancel): ").strip()
            if account_name:
                tracker.delete_account(account_name)
            
            input("\nPress Enter to continue...")
        
        elif choice == '10':
            clear_screen()
            categories = tracker.list_categories()
            if categories:
                print("\n" + "="*50)
                print("EXISTING CATEGORIES")
                print("="*50)
                for i, (name, limit) in enumerate(categories, 1):
                    print(f"  {i}. {name:<20s} Limit: R{limit:>10.2f}/month")
                print("="*50 + "\n")
            else:
                print("No categories to delete.")
                input("\nPress Enter to continue...")
                continue
            
            category_name = input("Enter category name to delete (or press Enter to cancel): ").strip()
            if category_name:
                tracker.delete_category(category_name)
            
            input("\nPress Enter to continue...")
        
        elif choice == '11':
            clear_screen()
            tracker.close()
            break
        
        else:
            print("Invalid option. Please try again.")
            input("\nPress Enter to continue...")


if __name__ == "__main__":
    main()