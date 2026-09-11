from dataclasses import dataclass, asdict
from enum import StrEnum
from typing import Any
from modules.core.ship.weaponry import WeaponDamage
from modules.core.entities.space import Vector2
from modules.core.entities.space import RelativePolarPosition

class EventType(StrEnum):
    SHOT = "shot"
    DEATH = "death"

@dataclass
class Event:
    initiator_id: str
    target_id: str

    def as_dict(self):
        return asdict(self)

@dataclass
class FireEvent(Event):
    source: Vector2
    damage: WeaponDamage

@dataclass
class FireEventResult(FireEvent):
    target: Vector2
    result: int
