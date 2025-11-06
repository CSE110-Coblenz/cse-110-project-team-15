# backend/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from routers.ping import ping_router
from routers.users import user_router
from routers.data import data_router

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

app.include_router(ping_router)
app.include_router(user_router)
app.include_router(data_router)

@app.get("/")
async def root():
    return {"ok": True}
