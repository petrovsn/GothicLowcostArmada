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

class TacticalBenavior:
    def __init__(self):
        pass

    def tick(self, perception, weapons, engine):
        pass

class Ship:
    def __init__(self, publish_event_queue = None):
        self.uuid = uuid4().hex
        self.name = f"Ship #{self.uuid[-5:]}"
        self.tier = "cruiser"
        self.engine = ShipEngine(25,90)
        self.weapons = ShipWeaponry()
        self.defence = ShipDefence()

        self.tactical_ai = TacticalBenavior()

        self.perception = None
        self.event_queue = publish_event_queue

    def place(self, x, y, rotation):
        self.engine.position = Position(x= x, y=y, rotation=rotation)

    def update_perception(self, new_perception):
        self.perception = new_perception

    def update_decisions(self):
        self.tactical_ai.tick(self.perception, self.weapons, self.engine)

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
        self.tier = "escort"
        self.engine = ShipEngine(0,0)