import asyncio
from dataclasses import dataclass, asdict
import enum
from uuid import UUID
from typing import Any


@dataclass
class Vector2:
    x: float
    y: float

@dataclass
class Position:
    x: float
    y: float
    rotation: float

    def as_dict(self):
        return asdict(self)

@dataclass
class RelativePolarPosition:
    bearing: float
    distance: float