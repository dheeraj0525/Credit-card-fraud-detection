from fastapi import APIRouter

router = APIRouter()

@router.get("/stats")
def stats():
    return {"total": 100}