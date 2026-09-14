from dataclasses import asdict, dataclass
from enum import StrEnum
from typing import ClassVar

from modules.core.entities.space import Vector2
from modules.core.ship.weaponry import WeaponDamage


class EventType(StrEnum):
    SHOT = "shot"
    DEATH = "death"

@dataclass
class Event:
    event_type: ClassVar[str] = "event"
    initiator_id: str
    target_id: str

    def as_dict(self):
        data = asdict(self)
        data["event_type"] = self.event_type
        return data

@dataclass
class FireEvent(Event):
    event_type: ClassVar[str] = "fire_event"
    source: Vector2
    damage: WeaponDamage

@dataclass
class FireEventResult(FireEvent):
    event_type: ClassVar[str]= "fire_event_result"
    target: Vector2
    result: int


@dataclass
class ShipDeathEvent(Event):
    event_type: ClassVar[str] = "ship_death_event"
    position: Vector2