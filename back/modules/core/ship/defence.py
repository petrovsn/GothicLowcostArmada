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
from modules.core.ship.entities import VesselClass
import pandas as pd


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

class DefenceMacroTable:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.table = pd.read_csv(
                "configs/battlefleet_gothic_gunnery_table.csv",
                sep=",", dtype=int, header=None
            )

        return cls._instance

    def _get_column(self, target_class: VesselClass, defence_sector: DefenceSector):
        if target_class.is_ordnance():
            return 5
        
        column_idx = 2
        if not target_class.is_capital():
            column_idx = 3

        match defence_sector:
            case DefenceSector.FRONT:
                column_idx+=0
            case DefenceSector.REAR:
                column_idx+=1
            case DefenceSector.LEFT:
                column_idx+=2
            case DefenceSector.RIGHT:
                column_idx+=2
            
        return column_idx

    def get_power(self, target_class: VesselClass, defence_sector: DefenceSector, initial_power: int):
        column_idx = self._get_column(target_class, defence_sector)
        row_idx = initial_power-1
        power = int(self.table.loc[row_idx, column_idx])
        return power



class ShipDefence:
    def __init__(self, vessel_class: str):
        self.armor = {DefenceSector.from_bearing(bearing):1 for bearing in [0, 90, 180, 270]}
        self.hp = 8
        self.shield = 2
        self.aa_points = 2
        self.vessel_class = vessel_class

    def _take_laser_shot(self, damage):
        if damage == 0: return 0
        success = get_success_tries(damage, 3)
        return success

    def _take_macro_shot(self, source_polar: RelativePolarPosition, damage):
        if damage == 0: return 0
        defence_sector = DefenceSector.from_bearing(source_polar.bearing)
        armor_value = self.armor[defence_sector]
        hit_dice_count = DefenceMacroTable().get_power(self.vessel_class, defence_sector, damage)
        success = get_success_tries(hit_dice_count, armor_value-1)
        return success

    def take_shot(self, source_polar: RelativePolarPosition, weapon_damage: WeaponDamage):
        hit_taken = self._take_macro_shot(source_polar, weapon_damage.MACRO)
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