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
from uuid import uuid4
from queue import Queue
from modules.core.engine.game_events import Event, FireEventResult, FireEvent
from modules.utils.geometry import get_relative_polar_position

class Ship:
    def __init__(self, events_queue: Queue = None):
        self.uuid = uuid4().hex
        self.name = f"Ship #{self.uuid[-5:]}"
        self.tier = "cruiser"
        self.engine = ShipEngine(25,90)
        self.weapons = ShipWeaponry()
        self.defence = ShipDefence()
        self.tactical_ai = TacticalBenavior(self.uuid)

        self.perception:ShipPerception = None
        self.events_queue: Queue = events_queue

        self.active = True

    def place(self, x, y, rotation):
        self.engine.position = Position(x= x, y=y, rotation=rotation)

    @property
    def position(self):
        return self.engine.position

    def _get_bearing(self, signal: Vector2):
        return get_relative_polar_position(self.position, signal)

    def update_perception(self, new_perception):
        self.perception = new_perception

    def update_decisions(self):
        events = self.tactical_ai.tick(self.perception, self.weapons, self.engine)
        if self.events_queue is not None:
            for event in events:
                self.events_queue.put(event)

    def update_state(self):
        self.engine.update()
        self.weapons.tick()

    def handle_command(self, new_order: ShipCommand):
        match new_order.action:
            case ShipCommandType.MOVE_TO:
                self.engine.set_target(new_order.target)
            case ShipCommandType.FIRE_TO:
                self.tactical_ai.set_target(new_order.target)

    def handle_event(self, event: Event):
        if isinstance(event, FireEvent):
            source_polar: RelativePolarPosition = self._get_bearing(event.source)
            hit_taken = self.defence.take_shot(source_polar, event.damage)
            print("HIT TAKEN", hit_taken, "HP", self.defence.hp)
            fire_result_event = FireEventResult(
                initiator_id=event.initiator_id,
                target_id=event.target_id,
                damage=event.damage,
                source=event.source,
                target=self.engine.position.to_vector(),
                result=hit_taken
            )
            self.events_queue.put(fire_result_event)

    def as_dict(self):
        return {
            "uuid":self.uuid,
            "name":self.name,
            "tier": self.tier,
            "is_active": self.active,
            "position": self.engine.position.as_dict(),
        }

    def get_info(self):
        return {
                    "uuid":self.uuid,
                    "name":self.name,
                    "tier": self.tier,
                    "is_active": self.active,
                    "engine": self.engine.as_dict(),
                    "weapons": self.weapons.as_dict(),
                    "defence": self.defence.as_dict()
            }




class Target(Ship):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.tier = "escort"
        self.engine = ShipEngine(0,0)