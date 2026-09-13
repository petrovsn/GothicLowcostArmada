from dataclasses import dataclass
from enum import StrEnum
from modules.core.ship.commands import ShipCommandType
class ReportStatus(StrEnum):
    SUCCESS = "success"
    CANCELED = "canceled"

@dataclass
class CommandReport:
    uuid: str
    status: ReportStatus
    command_type: ShipCommandType
