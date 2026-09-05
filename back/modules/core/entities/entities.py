import asyncio
from dataclasses import dataclass
import enum
from uuid import UUID
from typing import Any
from modules.core.entities.space import Position, Vector2
import math
from dataclasses import asdict
from modules.core.entities.time import GAME_FPS, GAME_ROUND


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
class ShipEngine:
    position: Position

    max_round_velocity: float
    max_round_rotation: float

    velocity: float
    ang_velocity: float

    def __init__(self, name, tier, max_round_velocity, max_round_rotation):
        self.max_round_velocity = max_round_velocity
        self.max_round_rotation = max_round_rotation

        self.name = name
        self.tier = ShipTier.CRUSIER

        self.max_velocity = max_round_velocity / (GAME_ROUND * GAME_FPS)
        self.max_ang_velocity = max_round_rotation / (GAME_ROUND * GAME_FPS)

    def update_position(self):
        dt = 1.0 / GAME_FPS

        angle = math.radians(self.position.rotation)

        self.position.x += math.sin(angle) * self.velocity * dt
        self.position.y += math.cos(angle) * self.velocity * dt

        self.position.rotation = (self.position.rotation + self.ang_velocity * dt) % 360

    def as_dict(self):
        return asdict(self)


class WeaponType(str, enum.Enum):
    TORPEDOS = "torpedos"
    LASERS = "lasers"
    MACRO = "macro"


class FireArc(str, enum.Enum):
    FRONT = "front"
    LEFT = "left"
    RIGHT = "right"
    REAR = "rear"
    ALL_AROUND = "all_around"


@dataclass
class Weapon:
    type: WeaponType
    fire_arc: FireArc
    range: float
    power: float

@dataclass
class ShipWeaponry:
    prow: list[Weapon]
    port: list[Weapon]
    starboard: list[Weapon]
    dorsal: list[Weapon]
    keel: list[Weapon]

    def get_weapons_for_target(self, bearing: float, distance: float)->list[Weapon]:
        ...


class DefenceSector(str, enum.Enum):
    FRONT = "front"
    LEFT = "left"
    RIGHT = "right"
    REAR = "rear"


@dataclass
class ShotResult:
    success: bool
    hit_taken: int

@dataclass
class ShipDefence:
    armor: dict[DefenceSector, int]
    hp: int
    shield: int
    aa_points: int

    def take_shot(self, damage_type: WeaponType, bearing: float, power: int) -> ShotResult:
        ...

@dataclass
class Ship:
    name: str
    model: str
    tier: ShipTier
    engine: ShipEngine
    weapons: ShipWeaponry