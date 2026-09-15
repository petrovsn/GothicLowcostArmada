from queue import Queue

from modules.core.entities.space import Position
from modules.core.ship.vessels.abc_vessel import AbstractVessel
from modules.core.ship.commands import ShipCommand, ShipCommandType
from modules.core.ship.components.engine import ShipEngine
from modules.core.ship.components.weaponry import ShipWeaponry
from modules.core.ship.vessel_class import VesselClass
from modules.core.ship.perception import ShipPerception
from modules.core.ship.components.tactical_ai import TacticalBehavior, TacticalTickReport, FireBehavior
from modules.core.entities.space import Position, Vector2, RelativePolarPosition
from modules.core.engine.game_events import TorpedosLaunchEvent


class EngineedVessel(AbstractVessel):
    def __init__(self, vessel_class: VesselClass, events_queue: Queue = None):
        super().__init__(vessel_class, events_queue)
        self.engine = ShipEngine()
        
    def place(self, position: Position):
        self.engine.position = position

    @property
    def position(self):
        return self.engine.position

    @property
    def velocity(self):
        return self.engine.velocity

    def update_state(self):
        super().update_state()
        self.engine.update()