# Add these to your routes or create a new settings.py router

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import BudgetTracker

router = APIRouter(prefix="/settings", tags=["settings"])
tracker = BudgetTracker('budget.db')

class FinancialMonthSetting(BaseModel):
    start_day: int

@router.get("/financial-month-start")
async def get_financial_month_start():
    """Get the current financial month start day"""
    return {
        "start_day": tracker.get_financial_month_start_day()
    }

@router.put("/financial-month-start")
async def set_financial_month_start(setting: FinancialMonthSetting):
    """Set the financial month start day (1-28)"""
    try:
        tracker.set_financial_month_start_day(setting.start_day)
        return {"message": "Financial month start day updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/performance")
async def get_performance():
    """Get comprehensive performance data for the current financial month"""
    return tracker.get_performance_data()