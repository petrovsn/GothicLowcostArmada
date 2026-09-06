from modules.core.ship.ship import Ship
from modules.core.ship.commands import parse_ship_command, ShipCommand
from modules.core.entities.commands import CommonCommand, CommandType


class GameEngine:
    def __init__(self):
        self.ships: dict[str, Ship] = {}

    def game_tick(self):
        """
        1. move ships
        2. collect fire events
        3. proceed fire events

        """

    def proceed_ship_command(self, new_command: CommonCommand):
        ship_command = parse_ship_command(new_command)
        if ship_command.ship_id in self.ships:
            self.ships[ship_command.ship_id].handle_command(ship_command)

    def proceed_command(self, new_command: CommonCommand):
        ...
            
    def get_entities(self):
        return {
            "ships": [ship.as_dict() for ship in self.ships],
            "ordnance": [],
        }