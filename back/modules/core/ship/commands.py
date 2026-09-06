from pydantic import BaseModel
import enum
from modules.core.entities.space import Position, Vector2, RelativePolarPosition
from modules.core.entities.commands import CommonCommand

class ShipCommandType(str, enum.Enum):
    MOVE_TO = "move_to"
    FIRE_TO = "fire_to"
    SET_THRUST = "set_thrust"

class ShipCommand(BaseModel):
    ship_id: str
    action: ShipCommandType
    target: Vector2|str

def parse_ship_command(command: CommonCommand) -> ShipCommand:
    return ShipCommand(
        ship_id=command.params["ship_id"],
        action=command.action,
        target=command.params["target"],
    )