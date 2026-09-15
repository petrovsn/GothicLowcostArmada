from queue import Queue

from modules.core.entities.space import Position
from modules.core.ship.vessels.abc_vessel import AbstractVessel
from modules.core.ship.commands import ShipCommand, ShipCommandType
from modules.core.ship.components.engine import ShipEngine
from modules.core.ship.components.weaponry import ShipWeaponry, TorpedosLaunchData
from modules.core.ship.vessel_class import VesselClass
from modules.core.ship.perception import ShipPerception
from modules.core.ship.components.tactical_ai import TacticalBehavior, TacticalTickReport, FireBehavior
from modules.core.entities.space import Position, Vector2, RelativePolarPosition
from modules.core.engine.game_events import TorpedosLaunchEvent
from modules.core.ship.vessels.engineed_vessel import EngineedVessel
from modules.utils.geometry import get_relative_polar_position

class Ship(EngineedVessel):
    def __init__(self, vessel_class: VesselClass, events_queue: Queue = None):
        super().__init__(vessel_class, events_queue)
        self.pattern = "default_ship"
        self.name = f"Ship: {self.uuid[-5:]}"

        self.weapons = ShipWeaponry()

        self.tactical_ai = TacticalBehavior(self.uuid)
        self.perception:ShipPerception = None
        self.order_report_queue: Queue = None

    def set_ai_report_channel(self, order_report_queue: Queue):
        self.order_report_queue = order_report_queue
        
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
        self.weapons.tick()


    def handle_command(self, new_order: ShipCommand):
        match new_order.action:
            case ShipCommandType.MOVE_TO:
                self.tactical_ai.set_destination(new_order.params)

            case ShipCommandType.FIRE_TO:
                self.tactical_ai.set_target(new_order.params)

            case ShipCommandType.SET_THRUST:
                self.engine.set_max_thrust(new_order.params)

            case ShipCommandType.CLEAR_DESTINATION:
                self.tactical_ai.set_destination(None)

            case ShipCommandType.FIRE_AT_WILL:
                self.tactical_ai.set_fire_behavior(FireBehavior.FIRE_AT_WILL)

            case ShipCommandType.CEASE_FIRE:
                self.tactical_ai.set_fire_behavior(FireBehavior.CEASE_FIRE)

            case ShipCommandType.CLEAR_TARGET:
                self.tactical_ai.set_destination(None)

            case ShipCommandType.TORPEDOS_LAUNCH:
                polar_position: RelativePolarPosition = self._get_bearing(new_order.params)
                torp_launch_data: TorpedosLaunchData = self.weapons.torpedos_launch(polar_position)
                if torp_launch_data is not None:
                    event = TorpedosLaunchEvent(
                        initiator_id=self.uuid,
                        target_id=self.uuid,
                        source=self.position.to_vector(),
                        bearing = self.position.rotation+polar_position.bearing,
                        params=torp_launch_data
                    )
                    self.events_queue.put(event)
    

    def as_dict(self):
        return {
            "uuid":self.uuid,
            "name":self.name,
            "pattern": self.pattern,
            "vessel_class": self.vessel_class,
            "is_active": self.active,
            "position": self.engine.position.as_dict(),
        }

    def get_info(self):
        return {
                    "uuid":self.uuid,
                    "name":self.name,
                    "pattern": self.pattern,
                    "vessel_class": self.vessel_class,
                    "is_active": self.active,
                    "engine": self.engine.as_dict(),
                    "weapons": self.weapons.as_dict(),
                    "defence": self.defence.as_dict()
            }






