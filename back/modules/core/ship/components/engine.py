import asyncio
from dataclasses import dataclass
import enum
from uuid import UUID
from typing import Any
from modules.core.entities.space import Position, Vector2, RelativePolarPosition
import math
from dataclasses import asdict
from modules.utils.geometry import get_relative_polar_position
from modules.utils.config_loader import ConfigLoader

GAME_ROUND = ConfigLoader().get_round_duration()
GAME_FPS = ConfigLoader().get_fps()

class ShipEngine:
    def __init__(self, max_round_velocity = 0, max_round_rotation = 0):
        self.position:Position = Position(float("Inf"), float("Inf"), 0)
        self.destination: Vector2 = None

        self.max_round_velocity = max_round_velocity
        self.max_round_rotation = max_round_rotation

        self.max_velocity = max_round_velocity / (GAME_ROUND)
        self.max_ang_velocity = max_round_rotation / (GAME_ROUND)

        self.ang_velocity = 0
        self.velocity = self.max_velocity

        self.thrust = 1
        self.max_thrust = 1

    def set_max_thrust(self, max_thrust):
        self.max_thrust = max_thrust

    def set_destination(self, destination:Vector2):
        self.destination = destination

    def get_closest_turn(self, bearing):
        if bearing<=180:
            return 1
        else:
            return -1

    def _bearing_out_of_turn(self, bearing):
        if 45 < bearing < (360 - 45):
            return True
        return False
        

    def update_velocities(self):
        self.thrust = min(1.0, self.max_thrust)
        self.ang_velocity = 0
        if self.destination is None:
            return 
        destination_polar_position:RelativePolarPosition = get_relative_polar_position(self.position, self.destination)
        if destination_polar_position.bearing < 0.1:
            self.ang_velocity = 0
        else:
            closest_turn = self.get_closest_turn(destination_polar_position.bearing)
            self.ang_velocity = closest_turn*self.max_ang_velocity
            if self._bearing_out_of_turn(destination_polar_position.bearing):
                self.thrust = min(0.5, self.max_thrust)


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
            "destination": self.destination.as_dict() if self.destination is not None else None,
            "thrust": self.thrust,
            "max_velocity": self.max_velocity*GAME_ROUND,
            "max_ang_velocity": self.max_ang_velocity*GAME_ROUND
        }