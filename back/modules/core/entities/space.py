import asyncio
from dataclasses import dataclass
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