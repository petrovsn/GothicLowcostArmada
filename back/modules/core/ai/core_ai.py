from queue import Queue
import asyncio
from dataclasses import dataclass
import enum
from uuid import UUID
from typing import Any
from modules.core.entities.space import Position, Vector2, RelativePolarPosition
import math
from dataclasses import asdict
from modules.core.entities.time import GAME_FPS, GAME_ROUND
from modules.core.ship.commands import ShipCommand, ShipCommandType
from modules.core.ship.engine import ShipEngine
from modules.core.ship.weaponry import ShipWeaponry
from modules.core.ship.defence import ShipDefence
from modules.core.ship.tactical_ai import TacticalBehavior
from modules.core.entities.commands import CommonCommand
from modules.core.ship.perception import ShipPerception
from modules.core.ship.entities import VesselClass
from uuid import uuid4
from queue import Queue
from modules.core.engine.game_events import Event, FireEventResult, FireEvent, ShipDeathEvent
from modules.utils.geometry import get_relative_polar_position
from abc import ABC, abstractmethod
from modules.core.ship.abc_vessel import AbstractVessel
import random
from modules.core.ai.reports import CommandReport, ReportStatus

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
                        target=Vector2(
                            x = random.randint(-50, 50),
                            y = random.randint(-50, 50),
                        )
                    )
                )
                self.busy_ships.append(ship_id)
            
        return ship_commands