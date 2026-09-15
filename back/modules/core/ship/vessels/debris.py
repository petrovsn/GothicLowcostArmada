from queue import Queue

from modules.core.engine.game_events import Event
from modules.core.entities.space import Position
from modules.core.ship.vessel_class import VesselClass


class Debris:
    def __init__(self, ship_dict: dict):
        self.uuid = ship_dict.get("uuid")
        self.name = ship_dict.get("name")+"[D]"
        self.vessel_class = VesselClass(ship_dict.get("vessel_class"))

    def place(self, x, y, rotation):
        self._position = Position(x, y, rotation)

    def update_state(self, *args, **kwargs):
        pass

    @property
    def position(self):
        return self._position

    def as_dict(self):
        return {
            "uuid":self.uuid,
            "name":self.name,
            "vessel_class": self.vessel_class,
            "is_active": False,
            "position": self.position.as_dict()
        }

    def handle_event(self, event: Event):
        ...