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
from modules.core.ship.perception import ShipPerception
from modules.core.engine.game_events import FireEvent

class TacticalBenavior:
    def __init__(self, uuid):
        self.uuid = uuid
        self.target_id = None
        self.destination = None

    def set_destination(self, destination: Vector2):
        self.destination = destination

    def set_target(self, target_id: str):
        self.target_id = target_id

    def tick(self, perception: ShipPerception, weapons:ShipWeaponry, engine:ShipEngine):
        output_events = []

        if engine.destination != self.destination:
            engine.set_destination(self.destination)

        if self.target_id is None: return []
        target_info = perception.enemy_entities.get(self.target_id, None)
        if target_info is not None:
            weapon_damage = weapons.fire_to(target_info.position)
            if weapon_damage is not None:
                fire_event = FireEvent(
                    initiator_id=self.uuid,
                    target_id=self.target_id,
                    damage=weapon_damage,
                    source=engine.position.to_vector()
                )
                output_events.append(fire_event)

        return output_events

