from modules.core.ship.ship import Ship, Target
from modules.core.ship.commands import parse_ship_command, ShipCommand
from modules.core.entities.commands import CommonCommand, CommandType
from modules.core.entities.space import Vector2, Position, RelativePolarPosition
from modules.utils.geometry import get_relative_polar_position
from random import randint
from collections import defaultdict
from modules.core.ship.perception import ShipPerception, ShipPerceptionInfo
from functools import lru_cache
from queue import Queue
from modules.core.engine.game_events import Event, FireEvent, FireEventResult

class GameEngine:
    def __init__(self):
        self.ships: dict[str, Ship] = {}
        self.fleets: dict[str, list] = defaultdict(list)
        self.events = Queue()
        self.events_output = []

    @lru_cache()
    def _get_owner_id(self, ship_id):
        for owner_id, fleet in self.fleets.items():
            if ship_id in fleet:
                return owner_id
        return None

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
            allied_entities={ship.uuid: self._get_relative_ship_info(owner_position,ship) for ship_id, ship in self.ships.items() if ship_id in self.fleets[owner_id]},
            enemy_entities={ship.uuid: self._get_relative_ship_info(owner_position,ship) for ship_id, ship in self.ships.items() if ship_id not in self.fleets[owner_id]},
        )
        return perception

    def game_tick(self):
        self.events_output = []
        for ship in self.ships.values():
            perception = self._get_perception_for_ship(ship.uuid)
            ship.update_perception(perception)

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


    def add_ship(self, player_id):
        ship = Ship(events_queue=self.events)
        ship.place(0,0,0)
        self.ships[ship.uuid] = ship
        self.fleets[player_id].append(ship.uuid)

    def add_target(self, participant_id):
        target = Target(events_queue=self.events)
        x = randint(-30, 30)
        y = randint(-30, 30)
        target.place(x,y,0)
        self.ships[target.uuid] = target
        self.fleets[participant_id].append(target.uuid)
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
            "events": self.events_output,
            "ordnance": [],
        }
        return result