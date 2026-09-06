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


class Ship:
    def __init__(self):
        self.uuid = UUID().hex
        self.name = f"Ship #{self.uuid[-5:]}"
        self.engine = ShipEngine(10,45)
        self.weapons = ShipWeaponry()
        self.defence = ShipDefence()

    def update_view(self):
        pass

    def update_position(self):
        self.engine.update()

    def handle_command(self, new_order: ShipCommand):
        match new_order.action:
            case ShipCommandType.MOVE_TO:
                self.engine.set_target(new_order.target)

    def as_dict(self):
        return {
            "uuid":self.uuid,
            "name":self.name,
            "position": self.engine.position.as_dict(),
        }

    def get_events(self):
        ...

    def proceed_events(self):
        ...
