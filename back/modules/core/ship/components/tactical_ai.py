import asyncio
from dataclasses import dataclass
import enum
from uuid import UUID
from typing import Any
from modules.core.entities.space import Position, Vector2, RelativePolarPosition
import math
from dataclasses import asdict
from modules.core.entities.time import GAME_FPS, GAME_ROUND
from modules.core.ship.commands import ShipCommand, ShipCommandType
from modules.core.ship.components.engine import ShipEngine
from modules.core.ship.components.weaponry import ShipWeaponry
from modules.core.ship.components.defence import ShipDefence
from modules.core.entities.commands import CommonCommand
from uuid import uuid4
from modules.core.ship.perception import ShipPerception
from modules.core.engine.game_events import FireEvent
from modules.core.ai.reports import CommandReport, ReportStatus
from dataclasses import dataclass
from enum import StrEnum


@dataclass
class TacticalTickReport:
    events: list
    reports: list


class FireBehavior(StrEnum):
    CEASE_FIRE = "cease_fire"
    FIRE_AT_WILL = "fire_at_will"


class TacticalBehavior:
    def __init__(self, uuid):
        self.uuid = uuid
        self.fire_behavior = FireBehavior.FIRE_AT_WILL
        self.target_id = None
        self.destination = None

    def set_fire_behavior(self, fire_behavior):
        self.fire_behavior = fire_behavior

    def set_destination(self, destination: Vector2):
        self.destination = destination

    def set_target(self, target_id: str):
        self.target_id = target_id

    def tick(
        self, perception: ShipPerception, weapons: ShipWeaponry, engine: ShipEngine
    ):
        output_events = []
        output_reports = []

        if engine.destination != self.destination:
            engine.set_destination(self.destination)

        if self.destination is not None:
            if engine.position.to_vector().distance(self.destination) < 1:
                self.set_destination(None)
                engine.set_destination(None)
                output_reports.append(
                    CommandReport(
                        uuid=self.uuid,
                        status=ReportStatus.SUCCESS,
                        command_type=ShipCommandType.MOVE_TO,
                    )
                )

        if self.target_id is None:
            if self.fire_behavior == FireBehavior.FIRE_AT_WILL:
                if len(perception.enemy_entities) > 0:
                    target_id = min(
                        perception.enemy_entities, key=lambda x: x.position.distance
                    )
                    target_info = perception.enemy_entities.get(target_id, None)
                    weapon_damage = weapons.fire_to(target_info.position)
                    if weapon_damage is not None:
                        fire_event = FireEvent(
                            initiator_id=self.uuid,
                            target_id=self.target_id,
                            damage=weapon_damage,
                            source=engine.position.to_vector(),
                        )
                        output_events.append(fire_event)

        else:
            target_info = perception.enemy_entities.get(self.target_id, None)
            if target_info is not None:
                weapon_damage = weapons.fire_to(target_info.position)
                if weapon_damage is not None:
                    fire_event = FireEvent(
                        initiator_id=self.uuid,
                        target_id=self.target_id,
                        damage=weapon_damage,
                        source=engine.position.to_vector(),
                    )
                    output_events.append(fire_event)

        return TacticalTickReport(events=output_events, reports=output_reports)
