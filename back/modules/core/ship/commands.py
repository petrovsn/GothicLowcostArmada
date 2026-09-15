from pydantic import BaseModel
import enum
from modules.core.entities.space import Position, Vector2, RelativePolarPosition
from modules.core.entities.commands import CommonCommand
from typing import Any

class ShipCommandType(str, enum.Enum):
    MOVE_TO = "move_to"
    FIRE_TO = "fire_to"
    SET_THRUST = "set_thrust"
    CLEAR_DESTINATION = "clear_destination"
    CEASE_FIRE = "cease_fire"
    FIRE_AT_WILL = "fire_at_will"
    CLEAR_TARGET = "clear_target"
    TORPEDOS_LAUNCH = "torpedos_launch"

class ShipCommand(BaseModel):
    ship_id: str
    action: ShipCommandType
    params: Any

def parse_ship_command(command: CommonCommand) -> ShipCommand:
    return ShipCommand(
        ship_id=command.params["ship_id"],
        action=ShipCommandType(command.action),
        params=command.params["target"],
    )