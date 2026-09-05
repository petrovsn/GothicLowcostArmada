from modules.core.maps.tiles import Tile
def generate_simple_map(shape):
    x,y = shape
    map = []
    map = [[Tile.WALL]+[Tile.EMPTY for i in range(x)]+[Tile.WALL] for j in range(y)]
    map.append([Tile.WALL for _ in range(x + 2)])
    map.insert(0, [Tile.WALL for _ in range(x + 2)])
    return map
