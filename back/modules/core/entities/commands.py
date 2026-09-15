import enum
from pydantic import BaseModel
from typing import Any

class CommandType(str, enum.Enum):
    GAME_ROOM = "game_room"
    ENGINE = "engine"
    SHIP = "ship"

class CommonCommand(BaseModel):
    type: CommandType
    action: str
    params: Any