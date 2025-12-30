from fastapi import APIRouter
from fastapi import HTTPException
from pydantic import BaseModel
from db import BudgetTracker

router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)

# Instantiate database manager
db = BudgetTracker()

#Listing accounts
@router.get("/")
def get_all_accounts():
    return db.list_accounts()

#Adding accountss
class AddAccountData(BaseModel):
    account_name: str
    account_balance: float
@router.put ("/addAccount")
def add_account(account: AddAccountData):
    try:
        db.add_account(account.account_name, account.account_balance)
        return{"message": "Account added succesfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

#Updating accounts
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

#Deleting acounts
class DelAccountData(BaseModel):
    account_name: str
@router.put("/deleteAccount")
def delete_account(account: DelAccountData):
    try:
        db.delete_account(account.account_name)
        return {"message": "Account deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

