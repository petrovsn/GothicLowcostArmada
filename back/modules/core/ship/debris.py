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
from modules.core.ship.tactical_ai import TacticalBehavior
from modules.core.entities.commands import CommonCommand
from modules.core.ship.perception import ShipPerception
from modules.core.ship.entities import VesselClass
from uuid import uuid4
from queue import Queue
from modules.core.engine.game_events import Event, FireEventResult, FireEvent, ShipDeathEvent
from modules.utils.geometry import get_relative_polar_position
from abc import ABC, abstractmethod
from modules.core.ship.abc_vessel import AbstractVessel

class Debris(AbstractVessel):
    def __init__(self, events_queue: Queue = None):
        self.vessel_class = VesselClass.ESCORT
        self._position = Position(float('Inf'), float('Inf'), 0)

    def from_ship_dict(self, ship_dict: dict):
        self.uuid = ship_dict.get("uuid")
        self.name = ship_dict.get("name")+"[D]"
        self.vessel_class = VesselClass(ship_dict.get("vessel_class"))

    def place(self, x, y, rotation):
        self._position = Position(x, y, rotation)

    def update_state(self, *args, **kwargs):
        pass

    @property
    def position(self):
        return self._position

    def as_dict(self):
        return {
            "uuid":self.uuid,
            "name":self.name,
            "vessel_class": self.vessel_class,
            "is_active": False,
            "position": self.position.as_dict()
        }

    def handle_event(self, event: Event):
        ...