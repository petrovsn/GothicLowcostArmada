import time
import asyncio
from uuid import uuid4
from modules.core.entities.space import Position, Vector2
from modules.core.entities.entities import Fleet, Ship, ShipGameStats
from modules.core.entities.participant import Participant, Player
from modules.utils.colors import get_color
from dataclasses import dataclass
import traceback

from modules.core.engine.engine import GameEngine
from modules.core.entities.time import GAME_FPS

@dataclass
class GameRoomConfig:
    room_id: str


@dataclass
class GameRoomStats:
    timestamp: int
    game_tick: float
    last_tick_execution_time: float
    

class GameRoom:
    def __init__(self):
        self.config = GameRoomConfig(
            room_id = uuid4().hex,
        )

        self.statistics = GameRoomStats(
            timestamp = 0,
            game_tick = 1.0/GAME_FPS,
            last_tick_execution_time = 0.0
        )
        self.participants: dict[str, Participant] = {}

        self.fleets: dict[str, Fleet] = {}

        self.entities: list[Ship] = []

        self.game_engine: GameEngine = GameEngine(self.statistics.game_tick)


    def start(self):
        self.game_loop_task = asyncio.create_task(self.game_loop())

    def stop(self):
        if self.game_loop_task is not None:
            self.game_loop_task.cancel()
            self.game_loop_task = None

    @property
    def room_id(self):
        return self.config.room_id

    def add_bot(self):
        ...


    def add_player(self) -> int:
        player_id = uuid4().hex
        player_color = get_color(player_id)
        self.participants[player_id] = Player(
            name="UnknownPlayer",
            connector=asyncio.Queue(maxsize=1),
            is_ready = False,
            color=player_color
        )
        return player_id

    def update_entities(self):
        self.ship.update_position(self.statistics.game_tick)

    def name_player(self, player_id, player_name):
        self.participants[player_id].name = player_name

    def remove_player(self,player_id):
        self.participants.pop(player_id)
        self.fleets.pop(player_id)

    def players_are_ready(self):
        player_exists = False
        for participant in self.participants.values():
            if isinstance(participant,Player):
                player_exists = True
        if not player_exists:
            return False
        for participant in self.participants.values():
            if not participant.is_ready: 
                return False
        return True

    def handle_command(self, player_id, command):
        if command == "ready":
            self.participants[player_id].is_ready = True
        elif command == "pause":
            self.participants[player_id].is_ready = False
        else:
            pass
            

    def check_world_collisions(self):
        ...
                    
    def next_step(self):
        self.statistics.timestamp+=1

    def update_world(self):
        self.game_engine.next_step()
        
    def get_game_data(self, player_id):
        return {
            "player_id":player_id,
            "service_info":{
                "room_id": self.config.room_id,
                "participants": [participant.to_dict() for participant in self.participants.values()],
                "timestamp": self.statistics.timestamp,
                "exec_time_current": self.statistics.last_tick_execution_time,
                "exec_time_max": self.statistics.game_tick
            },
            "player_fleet": self.fleets[player_id],
            "entities": self.game_engine.get_entities()
            
        }

    def update_views(self):
        for player_id, player in self.participants.items():
            if isinstance(player, Player):
                game_data = self.get_game_data(player_id)
                if player.connector.full():
                    player.connector.get_nowait()
                player.connector.put_nowait(game_data)

    async def game_loop(self):
        while True:
            time_start = time.perf_counter()
            try:
                if self.players_are_ready():
                    self.update_world()

                self.update_views()
            except Exception as e:
                print(f"GameRoom#{self.config.room_id} exception", e)
                print(traceback.format_exc())

            time_end = time.perf_counter()
            exec_time = time_end-time_start
            self.last_tick_execution_time = exec_time
            await asyncio.sleep(max(0,self.statistics.game_tick-exec_time))

    def get_data_connector(self, player_id):
        return self.participants[player_id].connector