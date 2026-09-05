import enum

class Tile(int, enum.Enum):
    EMPTY = 0
    SNAKE = 1
    FOOD = 2
    WALL = 3
    NEST = 4
    OBSTACLE = 5