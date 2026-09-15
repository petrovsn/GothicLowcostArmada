
from collections import defaultdict
from queue import Queue
from random import randint

from modules.core.ai.core_ai import AiPerception, CoreAi
from modules.core.engine.game_events import (
    Event,
    FireEvent,
    FireEventResult,
    VesselDeathEvent,
    TorpedosLaunchEvent
)
from modules.core.entities.commands import CommonCommand
from modules.core.entities.space import Position
from modules.core.ship.commands import ShipCommand
from modules.core.ship.factory import ShipFactory
from modules.core.ship.perception import ShipPerception, ShipPerceptionInfo
from modules.core.ship.vessels.abc_vessel import AbstractVessel
from modules.core.ship.vessels.debris import Debris
from modules.core.ship.vessels.ship import Ship
from modules.core.ship.vessels.target import Target
from modules.core.ship.vessels.torpedo import Torpedo
from modules.utils.geometry import get_relative_polar_position
from typing import Any

class GameEngine:
    def __init__(self):
        self.ships: dict[str, AbstractVessel] = {}
        self.static_objects: dict[str, Any] = {}
        self.owning: dict[str,str] = {}
        self.fleets: dict[str, list] = defaultdict(list)
        self.events = Queue()
        self.events_output = []
        self.ai:dict[str, CoreAi] = {}

    def _get_owner_id(self, ship_id):
        return self.owning.get(ship_id, None)

    def set_spawn_points(self, n_spawn_points):
        pass

    def _get_relative_ship_info(self, observer_position: Position, ship: Ship) -> ShipPerceptionInfo:
        relative_polar_position = get_relative_polar_position(observer_position, ship.position.to_vector())

        return ShipPerceptionInfo(
            vessel_class = ship.vessel_class,
            position = relative_polar_position,
            rotation = ship.position.rotation,

        )

    def _get_perception_for_ship(self, ship_id):
        owner_id = self._get_owner_id(ship_id)
        owner_position = self.ships[ship_id].position

        perception = ShipPerception(
            allied_entities={ship.uuid: self._get_relative_ship_info(owner_position,ship) for ship_id, ship in self.ships.items() 
                             if ship_id in self.fleets.get(owner_id, []) and not isinstance(ship, Debris)},
            enemy_entities={ship.uuid: self._get_relative_ship_info(owner_position,ship) for ship_id, ship in self.ships.items()
                             if ship_id not in self.fleets.get(owner_id, []) and not isinstance(ship, Debris)}
        )
        return perception

    def _get_perception_for_ai(self,owner_id):
        perception = AiPerception(
            fleet=self.get_fleet_info(owner_id),
            entities=self.get_entities()
        )
        return perception

    def game_tick(self):
        self.events_output = []
        for ship in self.ships.values():
            perception = self._get_perception_for_ship(ship.uuid)
            ship.update_perception(perception)

        for ai_id, ai in self.ai.items():
            ai_perception = self._get_perception_for_ai(ai_id)
            ai.update_perception(ai_perception)
            orders: list[ShipCommand] = ai.make_decisions()
            for order in orders:
                self.proceed_ship_command(order)

        for ship in self.ships.values():
            ship.update_decisions()

        while not self.events.empty():
            event = self.events.get()
            self._handle_event(event)

        for ship in self.ships.values():
            ship.update_state()

    def _handle_event(self, event:Event):
        if type(event) in [FireEvent]:
            ship = self.ships.get(event.target_id, None)
            if ship is not None:
                ship.handle_event(event)
        if type(event) in [FireEventResult]:
            self.events_output.append(event.as_dict())

        if isinstance(event, VesselDeathEvent):
            self.events_output.append(event.as_dict())
            self._handle_ship_death(event.target_id)

        if isinstance(event, TorpedosLaunchEvent):
            torpedo_instance = Torpedo(
                owner_id=event.initiator_id,
                params=event.params,
                events_queue=self.events
            )
            torpedo_instance.place(event.source.x, event.source.y, event.bearing)
            self.ships[torpedo_instance.uuid] = torpedo_instance

    def _handle_ship_death(self, ship_id):
        owner_id = self._get_owner_id(ship_id)
        if owner_id is not None:
            if ship_id in self.fleets[owner_id]:
                self.fleets[owner_id].remove(ship_id)
            debris = Debris(self.ships[ship_id].as_dict())
            debris.place(**self.ships[ship_id].position.as_dict())
            self.static_objects[ship_id] = debris
        self.owning.pop(ship_id,-1)
        self.ships.pop(ship_id, -1)

    def remove_participant(self, participant_id):
        fleet_to_remove = self.fleets[participant_id]
        for ship_id in fleet_to_remove:
            self._handle_ship_death(ship_id)
        self.fleets.pop(participant_id, -1)
        self.ai.pop(participant_id, -1)
        
    def add_bot(self, participant_id):
        self.ai[participant_id] = CoreAi()
        
    def add_ship(self, player_id):
        pattern_name = ShipFactory.get_random_template()
        order_report_queue = None
        if player_id in self.ai:
            order_report_queue = self.ai.get(player_id).order_report_queue

        ship: Ship = ShipFactory.ship_from_template(pattern_name, self.events, order_report_queue)

        ship.place(randint(-30,30),randint(-30,30),randint(0,359))

        self.ships[ship.uuid] = ship
        self.owning[ship.uuid] = player_id
        self.fleets[player_id].append(ship.uuid)
         
    def add_target(self, participant_id):
        target = Target(events_queue=self.events)
        x = randint(-30, 30)
        y = randint(-30, 30)
        target.place(x,y,0)
        self.ships[target.uuid] = target
        self.fleets[participant_id].append(target.uuid)
        self.owning[target.uuid] = participant_id
        return target.uuid


    def proceed_ship_command(self, ship_command: ShipCommand):
        if ship_command.ship_id in self.ships:
            self.ships[ship_command.ship_id].handle_command(ship_command)


    def proceed_command(self, new_command: CommonCommand):
        ...


    def get_fleet_info(self, player_id):
        return {
            ship_id: self.ships[ship_id].get_info() for ship_id in self.fleets[player_id]
        }

            
    def get_entities(self):
        result =  {
            "ships": [ship.as_dict() for ship in self.ships.values()],
            "static_objects": [ship.as_dict() for ship in self.static_objects.values()],
            "events": self.events_output,
            "torpedos": [],
        }
        return result