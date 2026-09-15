import random
from dataclasses import dataclass
from queue import Queue

from modules.core.ai.reports import CommandReport, ReportStatus
from modules.core.entities.space import Vector2
from modules.core.ship.commands import ShipCommand, ShipCommandType


@dataclass
class AiPerception:
    fleet:dict
    entities: dict 

class CoreAi:
    def __init__(self):
        self.order_report_queue = Queue()
        self.perception:AiPerception = None
        self.busy_ships = []
        
    def update_perception(self, new_perception:AiPerception):
        self.perception = new_perception

    def proceed_report_queue(self):
        while not self.order_report_queue.empty():
            report:CommandReport = self.order_report_queue.get()
            if report.status == ReportStatus.SUCCESS:
                self.busy_ships.remove(report.uuid)
            
        
    def make_decisions(self):
        self.proceed_report_queue()
        ship_commands = []
        for ship_id in self.perception.fleet:
            if ship_id not in self.busy_ships:
                ship_commands.append(
                    ShipCommand(
                        ship_id=ship_id,
                        action=ShipCommandType.MOVE_TO,
                        params=Vector2(
                            x = random.randint(-50, 50),
                            y = random.randint(-50, 50),
                        )
                    )
                )
                self.busy_ships.append(ship_id)
            
        return ship_commands