from fastapi import FastAPI

from core.config import settings

from routers.ping import ping_router
from routers.users import user_router
from routers.data import data_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
)

# Include routers
app.include_router(ping_router)
app.include_router(user_router)
app.include_router(data_router)

@app.get("/")
async def root():
    """Root endpoint."""
    return {"ok": True }