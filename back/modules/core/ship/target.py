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
from modules.core.ship.tactical_ai import TacticalBenavior
from modules.core.entities.commands import CommonCommand
from modules.core.ship.perception import ShipPerception
from modules.core.ship.entities import VesselClass
from uuid import uuid4
from queue import Queue
from modules.core.engine.game_events import Event, FireEventResult, FireEvent, ShipDeathEvent
from modules.utils.geometry import get_relative_polar_position
from abc import ABC, abstractmethod
from modules.core.ship.abc_vessel import AbstractVeccel

class Target(AbstractVeccel):
    def __init__(self, events_queue: Queue = None):
        super().__init__(events_queue)
        self.vessel_class = VesselClass.ESCORT
        self._position = Position(float('Inf'), float('Inf'), 0)

    def place(self, x, y, rotation):
        self._position = Position(x, y, rotation)

    @property
    def position(self):
        return self._position

    def as_dict(self):
        return {
            "uuid":self.uuid,
            "name":self.name,
            "vessel_class": self.vessel_class,
            "is_active": True,
            "position": self.position.as_dict()
        }
