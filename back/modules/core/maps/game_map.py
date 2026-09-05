import enum
import random
from typing import Callable
from modules.core.maps.tiles import Tile
from modules.core.maps.generators.generator_core import generate_simple_map
from collections import defaultdict
from modules.utils.distance import get_distance

class GameMap:
    def __init__(self,shape:tuple):
        self.shape = shape
        self.map = generate_simple_map(shape)
        self.placed_objects =defaultdict(list)

        self.additional_checks:list[Callable] = []

    def add_check(self, additional_check:Callable):
        self.additional_checks.append(additional_check)

    def perform_additional_checks(self, position):
        for check_func in self.additional_checks:
            result = check_func(position)
            if not result: return False
        return True

    def place_food_at_random_place(self):
        random_position = self.get_random_free_place()
        self.place_object(random_position, Tile.FOOD)

    def get_random_free_place(
        self,
        max_tries = 100
    ):
        for _ in range(max_tries):
            x_rand = random.randint(1, self.shape[0])
            y_rand = random.randint(1, self.shape[1])

            position = (x_rand, y_rand)

            if self.get_tile(position) != Tile.EMPTY:
                continue

            if not self.perform_additional_checks(position):
                continue

            return position
        return None

    def get_closest_tile(self, position, tile: Tile):
        tile_positions = self.placed_objects.get(tile, [])
        detected_position = None
        min_distance = float("Inf")
        for tile_position in tile_positions:
            distance_to_tile = get_distance(position,tile_position)
            if min_distance > distance_to_tile:
                min_distance = distance_to_tile 
                detected_position = tile_position
        return detected_position
    
    def place_object(self, position: tuple, item: Tile):
        x,y = position
        self.map[y][x] = item
        self.placed_objects[item].append((x,y))

    def remove_object(self, position):
        tile = self.get_tile(position)
        if tile in self.placed_objects:
            self.placed_objects[tile].remove(position)
        x,y = position
        self.map[y][x] = Tile.EMPTY

    def get_tile(self, position):
        x,y = position
        return self.map[y][x]

    def get_data(self):
        return self.map

    def _draw_(self):
        mapping = {
            Tile.EMPTY: " ",
            Tile.SNAKE: "S",
            Tile.WALL: "🧱",
            Tile.FOOD: "🍎",
            Tile.NEST: "O"
        }

        symbol_map = [
            "".join([mapping[tile] for tile in row]) for row in self.map[::-1]
        ]

        string_map = '\n'.join(symbol_map)

        return string_map