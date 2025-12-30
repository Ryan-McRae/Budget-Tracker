from fastapi import FastAPI
from routes import accounts, categories, settings  # Add settings
from fastapi.middleware.cors import CORSMiddleware
from db import BudgetTracker

app = FastAPI()

# Initialize the database when the app starts
budget_tracker = BudgetTracker('budget.db')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts.router)
app.include_router(categories.router)
app.include_router(settings.router)  # Add this