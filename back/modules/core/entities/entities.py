import asyncio
from dataclasses import dataclass
import enum
from uuid import UUID
from typing import Any
from modules.core.entities.space import Position, Vector2
import math

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

    velocity: float
    ang_velocity: float

    def update_position(self, dt: float):
        angle = math.radians(self.position.rotation)

        self.position.x += math.sin(angle) * self.velocity * dt
        self.position.y -= math.cos(angle) * self.velocity * dt

        self.position.rotation = (
            self.position.rotation + self.ang_velocity * dt
        ) % 360

@dataclass
class Fleet:
    total_cost: int
    ships: list[str] = []

    def add_ship(self, ship_name):
        self.ships.append(ship_name)

    