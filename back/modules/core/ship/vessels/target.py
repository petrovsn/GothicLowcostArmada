from queue import Queue
from modules.core.entities.space import Position
from modules.core.ship.vessel_class import VesselClass
from modules.core.ship.vessels.abc_vessel import AbstractVessel


class Target(AbstractVessel):
    def __init__(self, events_queue: Queue = None):
        super().__init__(events_queue)
        self._position = Position(float('Inf'), float('Inf'), 0)

    def place(self, x, y, rotation):
        self._position = Position(x, y, rotation)

    @property
    def position(self):
        return self._position

    def as_dict(self):
        return {
            "uuid":self.uuid,
            "name":self.name,
            "vessel_class": self.vessel_class,
            "is_active": True,
            "position": self.position.as_dict()
        }