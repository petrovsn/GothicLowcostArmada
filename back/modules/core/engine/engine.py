from modules.core.entities.entities import Ship

class GameEngine:
    def __init__(self, dt):
        self.dt = dt
        self.ships: list[Ship] = []

    def add_ship(self, ship):
        self.ships.append(ship)

    def move_ships(self):
        for ship in self.ships:
            ship.update_position(self.dt)

    def select_movement(self):
        for ship in self.ships:
            velocity, angle_velocity = 1,0 #tactial_ai
            ship.velocity = velocity
            ship.ang_velocity = angle_velocity

    def next_step(self):
        self.select_movement()
        self.move_ships()

    def get_entities(self):
        return {
            "ships": [ship.as_dict() for ship in self.ships],
            "ordnance": [],
        }