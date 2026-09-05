import time
import asyncio
from uuid import uuid4
from modules.core.entities import Snake, Player, Direction, Bot, Participant
from modules.core.maps.game_map import GameMap
from modules.core.maps.tiles import Tile
from modules.core.snake_collider import SnakesCollisionController
from modules.core.ai import BotAi
from modules.utils.colors import get_color
from modules.utils.names import get_name
from dataclasses import dataclass
import traceback

@dataclass
class GameRoomConfig:
    room_id: str

@dataclass
class GameRoomStats:
    timestamp: int
    game_tick: float
    last_tick_execution_time: float
    

class GameRoom:
    def __init__(self, shape: tuple = (20,20)):
        self.config = GameRoomConfig(
            room_id = uuid4().hex,
        )

        self.statistics = GameRoomStats(
            timestamp = 0,
            game_tick = 1.0/self.config.speed,
            last_tick_execution_time = 0.0
        )
        self.participants: dict[str, Participant] = {}


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


    def name_player(self, player_id, player_name):
        self.participants[player_id].name = player_name

    def remove_player(self,player_id):
        self.participants.pop(player_id)

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

    async def respawn_snake_with_latency(self, snake_id, latency):
        await asyncio.sleep(latency)
        self.respawn_snake(snake_id)

    def respawn_snake(self, snake_id):
        if self.config.respawn and not self.snakes[snake_id].is_alive:
            self.snake_collision_controller.free_from(snake_id)
            random_empty_position = self.game_map.get_random_free_place()       
            self.snakes[snake_id].respawn(random_empty_position)

    def handle_command(self, snake_id, command):
        if command == "ready":
            self.participants[snake_id].is_ready = True
        elif command == "respawn":
            self.respawn_snake(snake_id)
        else:
            try:
                direction = getattr(Direction, command.upper())
                self.snakes[snake_id].set_direction(direction)
            except AttributeError as e:
                print("wrong command")


    def update_snake_movement(self):
        for snake in self.snakes.values():
            snake.move()


    def snake_death(self, snake_id):
        self.participants[snake_id].change_points(-1)
        self.snakes[snake_id].death()
        if isinstance(self.participants[snake_id], Bot):
            asyncio.create_task(self.respawn_snake_with_latency(snake_id,2))


    def check_world_collisions(self):
        ...
                    
    def next_step(self):
        self.statistics.timestamp+=1


    def update_world(self):
        ...
        

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