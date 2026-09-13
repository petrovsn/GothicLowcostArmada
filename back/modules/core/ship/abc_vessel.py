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

class AbstractVeccel:
    def __init__(self, events_queue: Queue = None):
        self.uuid = uuid4().hex
        self.vessel_class = VesselClass.ESCORT
        self.name = f"Ship #{self.uuid[-5:]}"
        self.events_queue: Queue = events_queue
        self.active = True
        self.defence = ShipDefence(self.vessel_class)

    @property
    @abstractmethod
    def position(self) -> Position: pass

    @property
    def velocity(self):
        return 0

    @abstractmethod
    def place(self, x, y, rotation): pass

    def update_perception(self, *args, **kwargs):pass

    def update_decisions(self, *args, **kwargs):pass

    def update_state(self, *args, **kwargs):
        is_alive = self.defence.is_alive()
        if not is_alive:
            self.events_queue.put(ShipDeathEvent(
                        initiator_id=self.uuid, 
                        target_id=self.uuid,
                        position=self.position.to_vector()
                    ))

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
                result=hit_taken
            )
            self.events_queue.put(fire_result_event)