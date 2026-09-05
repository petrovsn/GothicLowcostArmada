from pydantic import BaseModel

class RoomCreationRequest(BaseModel):
    size_x:int = 10
    size_y:int = 10
    speed:int = 4
    n_bots:int = 0
    respawn:bool = True