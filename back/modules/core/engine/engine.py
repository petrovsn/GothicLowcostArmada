from modules.core.ship.ship import Ship, Target
from modules.core.ship.commands import parse_ship_command, ShipCommand
from modules.core.entities.commands import CommonCommand, CommandType
from random import randint

class GameEngine:
    def __init__(self):
        self.ships: dict[str, Ship] = {}

    def game_tick(self):
        for ship in self.ships.values():
            ship.update_view()

        for ship in self.ships.values():
            ship.update_position()


    def add_ship(self):
        ship = Ship()
        ship.place(0,0,0)
        self.ships[ship.uuid] = ship
        return ship.uuid

    def add_target(self):
        target = Target()
        x = randint(-30, 30)
        y = randint(-30, 30)
        target.place(x,y,0)
        self.ships[target.uuid] = target
        return target.uuid


    def proceed_ship_command(self, ship_command: ShipCommand):
        if ship_command.ship_id in self.ships:
            self.ships[ship_command.ship_id].handle_command(ship_command)

    def proceed_command(self, new_command: CommonCommand):
        ...

    def get_fleet_info(self, fleet_list: list[str]):
        return {
            ship_id: self.ships[ship_id].get_info() for ship_id in fleet_list
        }
            
    def get_entities(self):
        result =  {
            "ships": [ship.as_dict() for ship in self.ships.values()],
            "ordnance": [],
        }
        return result