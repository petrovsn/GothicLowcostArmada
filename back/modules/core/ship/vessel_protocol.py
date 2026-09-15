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
from modules.core.ship.components.engine import ShipEngine
from modules.core.ship.components.weaponry import ShipWeaponry
from modules.core.ship.components.defence import ShipDefence
from modules.core.ship.components.tactical_ai import TacticalBehavior
from modules.core.entities.commands import CommonCommand
from modules.core.ship.perception import ShipPerception
from modules.core.ship.vessel_class import VesselClass
from uuid import uuid4
from queue import Queue
from modules.core.engine.game_events import Event, FireEventResult, FireEvent, VesselDeathEvent
from modules.utils.geometry import get_relative_polar_position
from abc import ABC, abstractmethod


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
from modules.core.ship.components.engine import ShipEngine
from modules.core.ship.components.weaponry import ShipWeaponry
from modules.core.ship.components.defence import ShipDefence
from modules.core.ship.components.tactical_ai import TacticalBehavior
from modules.core.entities.commands import CommonCommand
from modules.core.ship.perception import ShipPerception
from modules.core.ship.vessel_class import VesselClass
from uuid import uuid4
from queue import Queue
from modules.core.engine.game_events import Event, FireEventResult, FireEvent, VesselDeathEvent
from modules.utils.geometry import get_relative_polar_position
from abc import ABC, abstractmethod

class VesselProtocol:
    def __init__(self, events_queue: Queue = None):
        ...

    @property
    def position(self) -> Position: 
         ...

    @property
    def velocity(self) -> float:
        ...

    def place(self, position: Position): 
        ...

    def update_perception(self, *args, **kwargs):
        ...

    def update_decisions(self, *args, **kwargs):
        ...

    def update_state(self, *args, **kwargs):
        ...

    def handle_event(self, event: Event):
        ...
