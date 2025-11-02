from fastapi import APIRouter
from fastapi import HTTPException
from pydantic import BaseModel
from db import BudgetTracker

router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)

# Instantiate your database manager
db = BudgetTracker()


@router.get("/")
def get_all_accounts():
    return db.list_accounts()

class UpdateAccountData(BaseModel):
    old_name: str
    new_name: str
    amount: float

@router.put("/update")
def update_account(account: UpdateAccountData):
    try:
        db.update_account(account.old_name, account.new_name, account.amount)
        return {"message": "Account updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

class DelAccountData(BaseModel):
    account_name: str

@router.put("/deleteAccount")
def delete_account(account: DelAccountData):
    try:
        db.delete_account(account.account_name)
        return {"message": "Account deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
