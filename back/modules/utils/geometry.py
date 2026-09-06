from modules.core.entities.space import Position, Vector2, RelativePolarPosition
import math


def get_distance(pos1: Position, pos2: Position) -> float:
    dx = pos2.x - pos1.x
    dy = pos2.y - pos1.y

    return math.hypot(dx, dy)


def get_relative_bearing(
    position: Position,
    rotation: float,
    signal: Vector2,
) -> float:
    """
    Возвращает bearing сигнала относительно направления объекта.

    0°   — прямо впереди
    90°  — справа
    180° — сзади
    270° — слева

    rotation:
        0°   = +Y
        90°  = +X
        180° = -Y
        270° = -X

    signal — мировая координата цели.
    """

    dx = signal.x - position.x
    dy = signal.y - position.y

    # Мировой bearing относительно +Y, по часовой стрелке.
    absolute_bearing = math.degrees(math.atan2(dx, dy)) % 360

    # Переводим в систему координат корабля.
    return (absolute_bearing - rotation) % 360


def get_angle_between(vector1: Vector2, vector2: Vector2) -> float:
    """
    Возвращает меньший угол между двумя векторами в градусах.
    Результат: [0°, 180°].
    """

    length1 = math.hypot(vector1.x, vector1.y)
    length2 = math.hypot(vector2.x, vector2.y)

    if length1 == 0 or length2 == 0:
        raise ValueError("Cannot calculate angle for zero-length vector")

    dot = vector1.x * vector2.x + vector1.y * vector2.y

    # Защита от погрешности floating point.
    cosine = dot / (length1 * length2)
    cosine = max(-1.0, min(1.0, cosine))

    return math.degrees(math.acos(cosine))


def get_relative_polar_position(position: Position,
    rotation: float,
    signal: Vector2,
) -> float:
    bearing = get_relative_bearing(position = position, rotation= rotation, signal= signal)
    distance = get_distance(position, signal)

    return RelativePolarPosition(
        bearing=bearing,
        distance=distance
    )