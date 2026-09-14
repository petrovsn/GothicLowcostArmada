from queue import Queue

from modules.core.entities.space import Position
from modules.core.ship.abc_vessel import AbstractVessel
from modules.core.ship.commands import ShipCommand, ShipCommandType
from modules.core.ship.engine import ShipEngine
from modules.core.ship.weaponry import ShipWeaponry
from modules.core.ship.entities import VesselClass
from modules.core.ship.perception import ShipPerception
from modules.core.ship.tactical_ai import TacticalBehavior, TacticalTickReport



class Ship(AbstractVessel):
    def __init__(self, events_queue: Queue = None):
        super().__init__(events_queue)
        self.vessel_class = VesselClass.CRUISER
        
        self.engine = ShipEngine()
        self.weapons = ShipWeaponry()
        
        self.tactical_ai = TacticalBehavior(self.uuid)

        self.perception:ShipPerception = None

        self.order_report_queue: Queue = None

    def set_ai_report_channel(self, order_report_queue: Queue):
        self.order_report_queue = order_report_queue
        

    def place(self, x, y, rotation):
        self.engine.position = Position(x= x, y=y, rotation=rotation)


    @property
    def position(self):
        return self.engine.position

    @property
    def velocity(self):
        return self.engine.velocity


    def update_perception(self, new_perception:ShipPerception):
        self.perception = new_perception

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

    def handle_command(self, new_order: ShipCommand):
        match new_order.action:
            case ShipCommandType.MOVE_TO:
                self.tactical_ai.set_destination(new_order.target)
            case ShipCommandType.FIRE_TO:
                self.tactical_ai.set_target(new_order.target)

    def as_dict(self):
        return {
            "uuid":self.uuid,
            "name":self.name,
            "vessel_class": self.vessel_class,
            "is_active": self.active,
            "position": self.engine.position.as_dict(),
        }

    def get_info(self):
        return {
                    "uuid":self.uuid,
                    "name":self.name,
                    "vessel_class": self.vessel_class,
                    "is_active": self.active,
                    "engine": self.engine.as_dict(),
                    "weapons": self.weapons.as_dict(),
                    "defence": self.defence.as_dict()
            }






