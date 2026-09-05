from fastapi import FastAPI
import asyncio
from modules.api.routes.game import game_router
from modules.api.routes.admin import admin_router
from contextlib import asynccontextmanager
from modules.core.game_manager import GameManager
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    game_manager = GameManager()
    await game_manager.start()
    app.state.game_manager =game_manager

    yield

    await game_manager.stop()


app = FastAPI(lifespan=lifespan)
app.include_router(game_router)
app.include_router(admin_router)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)