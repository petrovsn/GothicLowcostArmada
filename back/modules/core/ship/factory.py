"""
{
    "pattern": "Lunar",
    "cost":180,
    "class": "cruiser",
    "defence":{
        "hp":8,
        "shield":2,
        "turrets": 2 
    },
    "engine":{
        "speed": 25,
        "turns": 45
    },
    "weapons":{
        "prow":[
            "front/T/30/6"
        ],
        "port":[
            "left/M/30/6",
            "left/L/30/2"
        ],
        "starboard":[
            "right/M/30/6",
            "right/L/30/2"
        ]
    }
}
"""

from modules.core.ship.ship import Ship
from modules.core.ship.weaponry import ShipWeaponry, Weapon, FireArc, WeaponMountingPoint, WeaponType
from modules.core.ship.engine import ShipEngine
from modules.core.ship.defence import ShipDefence
from modules.core.ship.entities import VesselClass

from pydantic import BaseModel

class DefenceTemplate(BaseModel):
    hp: int
    shield: int
    turrets: int

class EngineTemplate(BaseModel):
    speed: int
    turns: int   

class ShipTemplate(BaseModel):
    pattern: str
    cost: int
    vessel_class: VesselClass
    defence: DefenceTemplate
    engine: EngineTemplate
    weapons: dict[WeaponMountingPoint,list[str]]


import glob
import json
def load_templates(templates_directory = "configs/templates"):
    templates_files = glob.glob(templates_directory+"/*.json")
    templates = {}
    for template_file in templates_files:
        try:
            with open(template_file) as f_in:
                template_json = json.load(f_in)
                template = ShipTemplate.model_validate(template_json)
                templates[template.pattern] = template
        except Exception as e:
            print(e)
            raise e

    return templates

class ShipFactory:
    templates = load_templates()

    @staticmethod
    def defence_from_template(vessel_class: str,defence_dto: DefenceTemplate):
        return ShipDefence(vessel_class, defence_dto.hp, defence_dto.shield, defence_dto.turrets)

    @staticmethod
    def engine_from_template(engine_dto: EngineTemplate):
        return ShipEngine(engine_dto.speed, engine_dto.turns)

    @staticmethod
    def _weapon_from_string(weapon_str:str):
        weapon_type_dict = {
            "M":WeaponType.MACRO,
            "L":WeaponType.LASERS,
            "T":WeaponType.TORPEDOS
        }
        fire_arc, weapon_type, weapon_range, weapon_power = weapon_str.strip().split('/')
        fire_arc = FireArc(fire_arc)
        weapon_type = weapon_type_dict[weapon_type]
        weapon_range = int(weapon_range)
        weapon_power = int(weapon_power)
        weapon = Weapon(weapon_type, fire_arc, weapon_range, weapon_power)
        return weapon

    @staticmethod
    def weapons_from_template(weapons_dto: dict[WeaponMountingPoint,list[str]]):
        weapons = ShipWeaponry()
        for mp, weapons_str_list in weapons_dto.items():
            for weapon_str in weapons_str_list:
                weapon = ShipFactory._weapon_from_string(weapon_str)
                weapons.add_weapon(mp,weapon)
        return weapons

    @staticmethod
    def ship_from_template(template_name, events_queue = None, reports_queue = None):
        template:ShipTemplate = ShipFactory.templates[template_name]
        ship = Ship(events_queue)
        ship.engine = ShipFactory.engine_from_template(template.engine)
        ship.defence = ShipFactory.defence_from_template(template.vessel_class, template.defence)
        ship.weapons = ShipFactory.weapons_from_template(template.weapons)
        ship.set_ai_report_channel(reports_queue)
        return ship