from pydantic import BaseModel

class RoomCreationRequest(BaseModel):
    n_players:int = 0
    max_fleet_points: int = 1000
