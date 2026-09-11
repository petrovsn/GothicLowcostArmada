import asyncio
from dataclasses import dataclass
import enum
from uuid import UUID
from typing import Any
from modules.core.entities.space import Position, Vector2, RelativePolarPosition
import math
from dataclasses import asdict
from modules.core.entities.time import GAME_FPS, GAME_ROUND
from modules.core.ship.commands import ShipCommand, ShipCommandType
from modules.core.ship.engine import ShipEngine
from modules.core.ship.weaponry import ShipWeaponry
from modules.core.ship.defence import ShipDefence
from modules.core.entities.commands import CommonCommand
from uuid import uuid4
from modules.core.entities.perception import ShipPerception

class TacticalBenavior:
    def __init__(self):
        pass

    def tick(self, perception: ShipPerception, weapons:ShipWeaponry, engine:ShipEngine):
        pass