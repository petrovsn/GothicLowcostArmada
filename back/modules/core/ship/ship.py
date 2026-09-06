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



class Ship:
    def __init__(self):
        self.uuid = uuid4().hex
        self.name = f"Ship #{self.uuid[-5:]}"
        self.tier = "cruiser"
        self.engine = ShipEngine(25,45)
        self.weapons = ShipWeaponry()
        self.defence = ShipDefence()

    def place(self, x, y, rotation):
        self.engine.position = Position(x= x, y=y, rotation=rotation)

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
            "tier": self.tier,
            "position": self.engine.position.as_dict(),
        }

    def get_info(self):
        return {
                    "uuid":self.uuid,
                    "name":self.name,
                    "tier": self.tier,
                    "engine": self.engine.as_dict(),
                    "weapons": self.weapons.as_dict(),
                    "defence": self.defence.as_dict()
            }


    def get_events(self):
        ...

    def proceed_events(self):
        ...


class Target(Ship):
    def __init__(self):
        super().__init__()
        self.engine = ShipEngine(0,0)