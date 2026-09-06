import asyncio
from dataclasses import dataclass
import enum
from uuid import UUID
from typing import Any
from modules.core.entities.space import Position, Vector2, RelativePolarPosition
import math
from dataclasses import asdict
from modules.core.entities.time import GAME_FPS, GAME_ROUND
from modules.utils.geometry import get_relative_polar_position

@dataclass
class ShipEngine:
    position: Position
    target: Position = None

    def __init__(self, max_round_velocity, max_round_rotation):
        self.max_round_velocity = max_round_velocity
        self.max_round_rotation = max_round_rotation

        self.max_velocity = max_round_velocity / (GAME_ROUND * GAME_FPS)
        self.max_ang_velocity = max_round_rotation / (GAME_ROUND * GAME_FPS)

        self.ang_velocity = 0
        self.velocity = self.max_velocity

    def set_target(self, new_target:Vector2):
        self.target = new_target

    def get_closest_turn(self, bearing):
        if bearing<=180:
            return 1
        else:
            return -1

    def update_velocities(self):
        if self.target is None:
            return 
        target_polar_position:RelativePolarPosition = get_relative_polar_position(self.target)
        if target_polar_position.bearing < 0.1:
            self.ang_velocity = 0
        else:
            closest_turn = self.get_closest_turn(target_polar_position.bearing)
            self.ang_velocity = closest_turn*self.max_ang_velocity

        self.velocity = self.max_velocity


    def update_position(self):
        dt = 1.0 / GAME_FPS
        angle = math.radians(self.position.rotation)
        self.position.x += math.sin(angle) * self.velocity * dt
        self.position.y += math.cos(angle) * self.velocity * dt
        self.position.rotation = (self.position.rotation + self.ang_velocity * dt) % 360


    def update(self):
        self.update_velocities()
        self.update_position()

    def as_dict(self):
        return asdict(self)