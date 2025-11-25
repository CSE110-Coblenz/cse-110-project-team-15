# backend/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.database import close_db_pool, init_db_pool
from routers.health import health_router

# from routers.ping import ping_router
# from routers.data import data_router
# from routers.users import user_router
from routers.register import register_router
from routers.login import login_router
from routers.delete import delete_router
# from api.routers.sync import   ...
from routers.sync import game_sync_router
from routers.update import game_update_router
from routers.save import game_save_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # add your Azure Static Web App URL later
    ],
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


@app.on_event("startup")
async def on_startup() -> None:
    await init_db_pool()


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await close_db_pool()


@app.get("/")
async def root():
    return {"ok": True}
