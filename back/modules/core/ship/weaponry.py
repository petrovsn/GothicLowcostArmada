import asyncio
from dataclasses import dataclass
import enum
from uuid import UUID
from typing import Any
from modules.core.entities.space import Position, Vector2, RelativePolarPosition
import math
from dataclasses import asdict
from modules.core.entities.time import GAME_FPS, GAME_ROUND


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

    @staticmethod
    def from_bearing(bearing: float):
        if 45 < bearing <= 135:
            return [FireArc.RIGHT, FireArc.ALL_AROUND]
        elif 135 < bearing <= 225:
            return [FireArc.REAR]
        elif 225 < bearing <= 315:
            return [FireArc.LEFT, FireArc.ALL_AROUND]
        else:
            return [FireArc.FRONT, FireArc.ALL_AROUND]


@dataclass
class Weapon:
    type: WeaponType
    fire_arc: FireArc
    range: float
    power: float

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.uuid = UUID()


class WeaponMountingPoint(str, enum.Enum):
    PROW = "prow"
    PORT = "port"
    STARBOARD = "starboard"
    DORSAL = "dorsal"
    KEEL = "keel"


from itertools import chain

@dataclass
class ShipWeaponry:
    mounting_points: dict[WeaponMountingPoint, Weapon]
    fire_arcs: dict[FireArc, Weapon]

    def __init__(self):
        self.mounting_points = {}
        self.fire_arcs = {}

    def add_weapon(self, mounting_point: WeaponMountingPoint, weapon: Weapon):
        self.mounting_points[mounting_point] = weapon
        self.fire_arcs[weapon.fire_arc] = weapon

    def get_weapons_for_target(
        self, polar_position: RelativePolarPosition
    ) -> list[Weapon]:
        fire_arcs = FireArc.from_bearing(polar_position.bearing)
        all_weapons_with_fire_arc = list(
            chain.from_iterable(self.fire_arcs[key] for key in fire_arcs)
        )
        weapons_with_enough_range = [
            weapon
            for weapon in all_weapons_with_fire_arc
            if weapon.range >= polar_position.distance
        ]
        return weapons_with_enough_range


    def fire_to(self, polar_position: RelativePolarPosition): 
        weapons: list[Weapon] = self.get_weapons_for_target(polar_position)