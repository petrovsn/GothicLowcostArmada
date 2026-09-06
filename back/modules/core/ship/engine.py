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

        self.max_velocity = max_round_velocity / (GAME_ROUND)
        self.max_ang_velocity = max_round_rotation / (GAME_ROUND)

        self.ang_velocity = 0
        self.velocity = self.max_velocity

        self.thrust = 1

    def set_target(self, new_target:Vector2):
        self.target = new_target

    def get_closest_turn(self, bearing):
        if bearing<=180:
            return 1
        else:
            return -1

    def _bearing_out_of_turn(self, bearing):
        if self.max_round_rotation < bearing < (360 - self.max_round_rotation):
            return True
        return False

    def update_velocities(self):
        if self.target is None:
            return 
        target_polar_position:RelativePolarPosition = get_relative_polar_position(self.position, self.target)
        if target_polar_position.bearing < 0.1:
            self.ang_velocity = 0
        else:
            closest_turn = self.get_closest_turn(target_polar_position.bearing)
            self.ang_velocity = closest_turn*self.max_ang_velocity
            self.thrust = 1.0
            if self._bearing_out_of_turn(target_polar_position.bearing):
                self.thrust = 0.5


        self.velocity = self.apply_velocity_modificators()

    def apply_velocity_modificators(self):
        required_velocity = self.max_velocity*self.thrust
        return max(self.max_velocity/2, required_velocity)

    def update_position(self):
        dt = 1.0 / GAME_FPS
        angle = math.radians(self.position.rotation)
        self.position.x += math.sin(angle) * self.velocity * self.thrust * dt
        self.position.y += math.cos(angle) * self.velocity * self.thrust * dt
        self.position.rotation = (self.position.rotation + self.ang_velocity * dt) % 360


    def update(self):
        if self.position is not None:
            self.update_velocities()
            self.update_position()

    def as_dict(self):
        return {
            "position": self.position.as_dict(),
            "target": self.target.as_dict() if self.target is not None else None,
            "thrust": self.thrust,
        }