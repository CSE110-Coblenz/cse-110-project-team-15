# backend/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.core.config import settings

from routers.health import health_router
from routers.data import data_router
from routers.users import user_router
# from api.routers.register import ...
# from api.routers.login import  ...
# from api.routers.delete import ...
# from api.routers.sync import   ...
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
app.include_router(user_router)
app.include_router(data_router)
app.include_router(game_update_router)
app.include_router(game_save_router)

@app.get("/")
async def root():
    return {"ok": True}
