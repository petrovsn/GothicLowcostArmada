from queue import Queue

from modules.core.entities.space import Position
from modules.core.ship.vessels.abc_vessel import AbstractVessel
from modules.core.ship.commands import ShipCommand, ShipCommandType
from modules.core.ship.components.engine import ShipEngine
from modules.core.ship.components.weaponry import ShipWeaponry
from modules.core.ship.components.defence import ShipDefence
from modules.core.ship.vessel_class import VesselClass
from modules.core.ship.perception import ShipPerception
from modules.core.ship.components.tactical_ai import TacticalBehavior, TacticalTickReport, FireBehavior



class Torpedo(AbstractVessel):
    def __init__(self, events_queue = None):
        super().__init__(events_queue)
        self.vessel_class = VesselClass.TORPEDOS
        self.defence = ShipDefence(self.vessel_class)
        self.engine = ShipEngine(30,0)
        self.perception:ShipPerception = None

    def place(self, x, y, rotation):
        self.engine.position = Position(x= x, y=y, rotation=rotation)

    def update_perception(self, new_perception:ShipPerception):
        self.perception = new_perception

    @property
    def position(self):
        return self.engine.position

    @property
    def velocity(self):
        return self.engine.velocity


    def update_decisions(self):
        tactical_tick_report:TacticalTickReport = self.tactical_ai.tick(self.perception, self.weapons, self.engine)
        if self.events_queue is not None:
            for event in tactical_tick_report.events:
                self.events_queue.put(event)

        if self.order_report_queue is not None:
            for report in tactical_tick_report.reports:
                self.order_report_queue.put(report)

    def update_state(self):
        super().update_state()
        self.engine.update()
        self.weapons.tick()
