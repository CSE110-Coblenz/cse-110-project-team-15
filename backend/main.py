# backend/api/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.database import close_db_pool, init_db_pool
from routers.health import health_router

from routers.register import register_router
from routers.login import login_router
from routers.delete import delete_router

from routers.sync import game_sync_router
from routers.update import game_update_router
from routers.save import game_save_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_pool()
    yield
    await close_db_pool()

app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
# app.include_router(user_router)
app.include_router(register_router)
app.include_router(login_router)
app.include_router(delete_router)
# app.include_router(data_router)
app.include_router(game_update_router)
app.include_router(game_save_router)
app.include_router(game_sync_router)





@app.get("/")
async def root():
    return {"ok": True}
