import asyncio
from dataclasses import dataclass, field
import enum
from uuid import uuid4
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
    uuid: str = field(
        default_factory=lambda: uuid4().hex
    )


class WeaponMountingPoint(str, enum.Enum):
    PROW = "prow"
    PORT = "port"
    STARBOARD = "starboard"
    DORSAL = "dorsal"
    KEEL = "keel"


from itertools import chain
from datetime import datetime
from collections import defaultdict

@dataclass
class ShipWeaponry:
    mounting_points: dict[WeaponMountingPoint, list[Weapon]]
    fire_arcs: dict[FireArc,list[Weapon]]

    def __init__(self):
        self.mounting_points = defaultdict(list)
        self.fire_arcs = defaultdict(list)
        #self.reloadig: dict[str, datetime]

        new_weapon = Weapon(type = WeaponType.MACRO, fire_arc=FireArc.FRONT, power=6, range=30)
        self.add_weapon(WeaponMountingPoint.PROW, new_weapon)
        new_weapon = Weapon(type = WeaponType.MACRO, fire_arc=FireArc.RIGHT, power=6, range=30)
        self.add_weapon(WeaponMountingPoint.STARBOARD, new_weapon)
        new_weapon = Weapon(type = WeaponType.MACRO, fire_arc=FireArc.LEFT, power=6, range=30)
        self.add_weapon(WeaponMountingPoint.PORT, new_weapon)

    def add_weapon(self, mounting_point: WeaponMountingPoint, weapon: Weapon):
        self.mounting_points[mounting_point].append(weapon)
        self.fire_arcs[weapon.fire_arc].append(weapon)

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

    def as_dict(self):
        return {
            "mounting_points": {
                mounting_point.value: [
                    {
                        "uuid": weapon.uuid,
                        "type": weapon.type.value,
                        "fire_arc": weapon.fire_arc.value,
                        "range": weapon.range,
                        "power": weapon.power,
                    }
                    for weapon in weapons
                ]
                for mounting_point, weapons
                in self.mounting_points.items()
            }
        }