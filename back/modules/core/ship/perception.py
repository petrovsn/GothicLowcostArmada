from dataclasses import dataclass
from modules.core.entities.space import RelativePolarPosition

@dataclass
class ShipPerceptionInfo:
    tier: str
    position: RelativePolarPosition
    rotation: float

@dataclass
class ShipPerception:
    allied_entities: dict[str, ShipPerceptionInfo]
    enemy_entities: dict[str, ShipPerceptionInfo]