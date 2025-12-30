from fastapi import APIRouter
from fastapi import HTTPException
from pydantic import BaseModel
from db import BudgetTracker

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

# Instantiate database manager
db = BudgetTracker()

#Listing categories
@router.get("/")
def get_all_catgoires():
    return db.list_categories()

#Updating category
class UpdateCategoryData(BaseModel):
    cat_name: str
    limit: float
@router.put("/updateCategory")
def updateCategory(category: UpdateCategoryData):
    try:
        db.update_category(category.cat_name, category.limit)
        return {"message": "Category updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

#Deleting category 
class DeleteCategoryData(BaseModel):
    category_name: str
@router.put("/deleteCategory")
def deleteCategory(category: DeleteCategoryData):
    try:
        db.delete_category(category.category_name)
        return {"message": "Category deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

#Adding category
class AddCategoryData(BaseModel):
    category_name: str
    category_limit: float
@router.put("/addCategory")
def adddCategory(category: AddCategoryData):
    try:
        db.add_category(category.category_name, category.category_limit)
        return {"message": "Category added successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

#Adding transactions to category
class AddTransactionData(BaseModel):
    account_name: str
    category: str
    amount: float
    description: str
@router.put("/recordTransaction")
def recordTransaction(transaction: AddTransactionData):
    try:
        db.record_transaction(
            transaction.account_name,
            transaction.category,
            float(transaction.amount),
            transaction.description
        )
        return {"message": "Transaction recorded successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
