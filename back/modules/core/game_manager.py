import asyncio
from datetime import datetime, timedelta
from modules.core.game_engine import GameEngine
from modules.core.game_rooms.core import GameRoom
from dataclasses import dataclass
from modules.core.game_rooms.core import GameRoom

@dataclass
class RoomData:
    room: GameRoom
    empty_since: datetime = None

class GameManager:
    def __init__(self):
        self.rooms: dict[str, RoomData] = {}
        self.clearing_loop_task = None

    async def start(self):
        self.clearing_loop_task = asyncio.create_task(
            self.clearing_loop()
        )

    async def stop(self):
        if self.clearing_loop_task:
            self.clearing_loop_task.cancel()

            try:
                await self.clearing_loop_task
            except asyncio.CancelledError:
                pass

    def create_room(self, shape):
        new_room = GameRoom(shape)
        room_id = new_room.room_id
        new_room.start()
        self.rooms[room_id] = RoomData(
            room = new_room
        )
        return room_id

    def get_room(self, room_id):
        room_data = self.rooms.get(room_id, None)
        if room_data is not None:
            return room_data.room
        return None 

    def close_room(self, room_id):
        room_data = self.rooms.pop(room_id, None)

        if room_data is None:
            return

        room_data.room.stop()

    async def clearing_loop(self):
        while True:
            await asyncio.sleep(10)

            now = datetime.now()
            rooms_to_close = []

            for room_id, room_data in self.rooms.items():
                room = room_data.room

                if room.participants:
                    room_data.empty_since = None
                    continue

                if room_data.empty_since is None:
                    room_data.empty_since = now
                    continue

                if now - room_data.empty_since > timedelta(minutes=1):
                    rooms_to_close.append(room_id)

            for room_id in rooms_to_close:
                self.close_room(room_id)
                    



