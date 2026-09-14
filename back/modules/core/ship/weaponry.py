import enum
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from itertools import chain
from uuid import uuid4

from modules.core.entities.space import RelativePolarPosition
from modules.utils.config_loader import ConfigLoader

GAME_ROUND = ConfigLoader().get_round_duration()
GAME_FPS = ConfigLoader().get_fps()

class WeaponType(enum.StrEnum):
    TORPEDOS = "torpedos"
    LASERS = "lasers"
    MACRO = "macro"

@dataclass
class WeaponDamage:
    LASERS: int
    MACRO: int

class FireArc(enum.StrEnum):
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

    @property
    def reloaing(self):
        return GAME_ROUND*GAME_FPS


class WeaponMountingPoint(str, enum.Enum):
    PROW = "prow"
    PORT = "port"
    STARBOARD = "starboard"
    DORSAL = "dorsal"
    KEEL = "keel"

class ShipWeaponry:
    def __init__(self):
        self.mounting_points = defaultdict(list)
        self.fire_arcs = defaultdict(list)
        self.reloading: Counter = Counter()

    def add_weapon(self, mounting_point: WeaponMountingPoint, weapon: Weapon):
        self.mounting_points[mounting_point].append(weapon)
        self.fire_arcs[weapon.fire_arc].append(weapon)
        self.reloading[weapon.uuid] = 0

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
            if weapon.range >= polar_position.distance and
            self.reloading[weapon.uuid] == 0
        ]
        return weapons_with_enough_range

    def is_target_in_fire_range(self, target: RelativePolarPosition):
        fire_arc = FireArc.from_bearing(target.bearing)
        for weapon in self.fire_arcs[fire_arc]:
            if weapon.range >= target.distance:
                return  True
        return False


    def get_available_targets(self, target_list: list[RelativePolarPosition]):
        return []

    def fire_to(self, target: RelativePolarPosition) -> WeaponDamage: 
        weapons: list[Weapon] = self.get_weapons_for_target(target)
        if len(weapons) == 0: return None
        summary_damage = Counter()
        for weapon in weapons:
            summary_damage[weapon.type]+=weapon.power
            self.reloading[weapon.uuid] = weapon.reloading

        return WeaponDamage(
            LASERS=summary_damage[WeaponType.LASERS],
            MACRO=summary_damage[WeaponType.MACRO]
        )

    def tick(self):
        for weapon_id in self.reloading:
            self.reloading[weapon_id] = max(0, self.reloading[weapon_id]-1)

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