from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request, Body
from modules.core.game_engine import GameRoom
from modules.core.game_manager import GameManager
import asyncio
from modules.api.schemas.schemas import RoomCreationRequest

game_router = APIRouter(prefix="/game", tags=["ws"])

class PlayerConnection:
    def __init__(self, player_id, game_room:GameRoom, websocket:WebSocket):
        self.player_id = player_id
        self.game_room:GameRoom = game_room
        self.websocket:WebSocket = websocket

    async def send_game_data(self):
        connector: asyncio.Queue = self.game_room.get_data_connector(self.player_id)
        while True:
            game_data = await connector.get()
            await self.websocket.send_json(game_data)

    async def receive_commands(self):
        try:
            while True:
                message = await self.websocket.receive_json()
                print(f"messege received: {message}")
                received_command= message.get("command", None)
                if received_command is not None:
                    self.game_room.handle_command(self.player_id,received_command )
                new_player_name = message.get("set_player_name", None)
                if new_player_name is not None:
                    self.game_room.name_player(self.player_id, new_player_name)

        except WebSocketDisconnect:
            print("connection closed")


@game_router.websocket("/{game_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    game_id: str,
):
    await websocket.accept()

    game_manager:GameManager = websocket.app.state.game_manager
    game_room:GameRoom = game_manager.get_room(game_id)
    player_id = game_room.add_player()

    player_connection = PlayerConnection(player_id, game_room, websocket)

    receive_task = asyncio.create_task(
        player_connection.receive_commands()
    )

    send_task = asyncio.create_task(
        player_connection.send_game_data()
    )

    done, pending = await asyncio.wait(
        [receive_task, send_task],
        return_when=asyncio.FIRST_COMPLETED,
    )

    for task in pending:
        task.cancel()

    await asyncio.gather(
        *pending,
        return_exceptions=True,
    )

    game_room.remove_player(player_id)


@game_router.post("/rooms")
async def create_room(request: Request, room_creation_request: RoomCreationRequest = Body()):
    game_manager: GameManager = request.app.state.game_manager
    room_id = game_manager.create_room(shape=(room_creation_request.size_x, room_creation_request.size_y),
                                       speed=room_creation_request.speed,
                                       n_bots=room_creation_request.n_bots,
                                       respawn=room_creation_request.respawn)
    return {
        "room_id": room_id
    }