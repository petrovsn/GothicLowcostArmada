from fastapi import APIRouter

admin_router = APIRouter(prefix="/admin", tags=["admin"])


@admin_router.get("/test")
async def admin_test():
    return "server is alive"