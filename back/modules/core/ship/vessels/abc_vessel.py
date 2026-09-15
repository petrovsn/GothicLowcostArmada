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
from modules.core.engine.game_events import (
    Event,
    FireEventResult,
    FireEvent,
    VesselDeathEvent,
)
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
from modules.core.engine.game_events import (
    Event,
    FireEventResult,
    FireEvent,
    VesselDeathEvent,
)
from modules.utils.geometry import get_relative_polar_position
from abc import ABC, abstractmethod


class AbstractVessel(ABC):
    def __init__(self, vessel_class: VesselClass, events_queue: Queue = None):
        self.uuid = uuid4().hex
        self.events_queue: Queue = events_queue
        self.defence = ShipDefence(vessel_class)

    @property
    def vessel_class(self):
        return self.defence.vessel_class

    @property
    def active(self):
        return self.defence.hp>0

    @property
    @abstractmethod
    def position(self) -> Position:
        raise NotImplementedError

    @property
    @abstractmethod
    def velocity(self) -> float:
        raise NotImplementedError

    @abstractmethod
    def place(self, x, y, rotation):
        raise NotImplementedError

    @abstractmethod
    def update_perception(self, *args, **kwargs):
        raise NotImplementedError

    @abstractmethod
    def update_decisions(self, *args, **kwargs):
        raise NotImplementedError

    def update_state(self, *args, **kwargs):
        self.defence.tick()
        is_alive = self.defence.is_alive()
        if not is_alive:
            self.events_queue.put(
                VesselDeathEvent(
                    initiator_id=self.uuid,
                    target_id=self.uuid,
                    position=self.position.to_vector(),
                )
            )

    def _get_bearing(self, signal: Vector2):
        return get_relative_polar_position(self.position, signal)

    def handle_event(self, event: Event):
        if isinstance(event, FireEvent):
            source_polar: RelativePolarPosition = self._get_bearing(event.source)
            hit_taken = self.defence.take_shot(source_polar, event.damage)
            fire_result_event = FireEventResult(
                initiator_id=event.initiator_id,
                target_id=event.target_id,
                damage=event.damage,
                source=event.source,
                target=self.position.to_vector(),
                result=hit_taken,
            )
            self.events_queue.put(fire_result_event)
