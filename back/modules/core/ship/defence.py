import asyncio
from dataclasses import dataclass
import enum
from uuid import UUID
from typing import Any
from modules.core.entities.space import Position, Vector2, RelativePolarPosition
import math
from dataclasses import asdict
from modules.core.entities.time import GAME_FPS, GAME_ROUND
from modules.core.engine.game_events import Event, FireEventResult, FireEvent
from modules.utils.geometry import get_relative_polar_position
from modules.core.ship.weaponry import WeaponDamage
from modules.utils.random import get_success_tries

class DefenceSector(str, enum.Enum):
    FRONT = "front"
    LEFT = "left"
    RIGHT = "right"
    REAR = "rear"

    @staticmethod
    def from_bearing(bearing: float):
        if 45 < bearing <= 135:
            return DefenceSector.RIGHT
        elif 135 < bearing <= 225:
            return DefenceSector.REAR
        elif 225 < bearing <= 315:
            return DefenceSector.LEFT
        else:
            return DefenceSector.FRONT

class ShipDefence:
    def __init__(self):
        self.armor = {DefenceSector.from_bearing(bearing):1 for bearing in [0, 90, 180, 270]}
        self.hp = 8
        self.shield = 2
        self.aa_points = 2

    def _take_laser_shot(self, damage):
        success = get_success_tries(damage, 3)
        return success

    def _take_macro_shot(self, damage):
        return 0

    def take_shot(self, source_polar: RelativePolarPosition, weapon_damage: WeaponDamage):
        hit_taken = self._take_macro_shot(weapon_damage.MACRO)
        hit_taken+= self._take_laser_shot(weapon_damage.LASERS)
        self.hp -= hit_taken
        return hit_taken
        
    def as_dict(self):
            return {
                "hp":self.hp,
                "shield": self.shield,
                "armor": self.armor,
                "aa_point": self.aa_points
            }