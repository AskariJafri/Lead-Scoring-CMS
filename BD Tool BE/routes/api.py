from fastapi import APIRouter
from src.endpoints import file
from src.endpoints import user
from src.endpoints import auth
router=APIRouter()

router.include_router(user.router)
router.include_router(auth.router)
router.include_router(file.router)
# router.include_router(score_leads_endpoint.router)
