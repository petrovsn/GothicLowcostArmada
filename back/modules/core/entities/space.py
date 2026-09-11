import asyncio
from dataclasses import dataclass, asdict
import enum
from uuid import UUID
from typing import Any



@dataclass
class Vector2:
    x: float
    y: float

    def as_dict(self):
        return asdict(self)

@dataclass
class Position:
    x: float
    y: float
    rotation: float

    def to_vector(self):
        return Vector2(self.x, self.y)

    def as_dict(self):
        return asdict(self)

@dataclass(frozen=True)
class RelativePolarPosition:
    bearing: float
    distance: float

    def as_dict(self):
        return asdict(self)