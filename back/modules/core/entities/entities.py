import asyncio
from dataclasses import dataclass
import enum
from uuid import UUID
from typing import Any
from modules.core.entities.space import Position, Vector2

class ShipTier(str, enum.Enum):
    ESCORT = "escort"
    CRUSIER = "crusier"
    BATTLESHIP = "battleship"

@dataclass
class ShipGameStats:
    hp: int
    shield: int
    aa_points: int

    max_speed: float
    max_turn: float

@dataclass
class Ship:
    name: str
    tier: ShipTier

    position: Position
    velocity: Vector2

    stats: ShipGameStats

    def to_dict(self):
        return {
            ""
        }
