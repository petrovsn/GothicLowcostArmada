import asyncio
from dataclasses import dataclass
import enum
from uuid import UUID
from typing import Any


@dataclass
class Participant:
    name: str
    color: str
    points: int = 0
    is_ready: bool = False

    def to_dict(self):
        return {
            "name":self.name,
            "color": self.color,
            "points": self.points,
            "is_ready": self.is_ready
        }

    def change_points(self, value):
        self.points+=value

@dataclass
class Player(Participant):
    connector: asyncio.Queue = None

@dataclass
class Bot(Participant):
    is_ready: bool = True
    ai: Any = lambda x: None