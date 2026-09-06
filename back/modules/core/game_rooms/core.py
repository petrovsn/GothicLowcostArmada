import time
import asyncio
from uuid import uuid4
from modules.core.entities.space import Position, Vector2
from modules.core.entities.participant import Participant, Player, Bot
from modules.utils.colors import get_color
from modules.utils.names import get_name
from dataclasses import dataclass
import traceback
from modules.core.entities.commands import CommonCommand, CommandType
from modules.core.engine.engine import GameEngine
from modules.core.entities.time import GAME_FPS
from collections import defaultdict
from modules.core.ship.commands import parse_ship_command, ShipCommand

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
        self.fleets: dict[str, list] = defaultdict(list)
        self.game_engine: GameEngine = GameEngine()

        self.add_bot()

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
        participant_id = uuid4().hex
        participant_color = get_color(participant_id)
        name = get_name(participant_id)
        self.participants[participant_id] = Bot(
            name=name,
            is_ready = True,
            color=participant_color
        )

        for i in range(5):
            ship_id = self.game_engine.add_target()
            self.fleets[participant_id].append(ship_id)

        return participant_id


    def add_player(self) -> int:
        player_id = uuid4().hex
        player_color = get_color(player_id)
        self.participants[player_id] = Player(
            name="UnknownPlayer",
            connector=asyncio.Queue(maxsize=1),
            is_ready = False,
            color=player_color
        )


        ship_id = self.game_engine.add_ship()
        self.fleets[player_id].append(ship_id)

        return player_id

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

    def handle_command(self, player_id, command: dict):
        new_command = CommonCommand(**command)
        match new_command.type:
            case CommandType.GAME_ROOM:
                self._handle_room_command(player_id, new_command)
            case CommandType.SHIP:
                ship_command = parse_ship_command(new_command)
                if ship_command.ship_id in self.fleets[player_id]:
                    self.game_engine.proceed_ship_command(ship_command)
            case CommandType.ENGINE:
                self.game_engine.proceed_command(new_command)

    def _handle_room_command(self, player_id, command: CommonCommand):
        match command.action:
            case "pause":
                self.participants[player_id].is_ready = False
            case "resume":
                self.participants[player_id].is_ready = True

            
    def check_world_collisions(self):
        ...
                    
    def next_step(self):
        self.statistics.timestamp+=1

    def update_world(self):
        self.game_engine.game_tick()


    def _get_participants(self):
        return {participant_id: participant.to_dict() for participant_id, participant in self.participants.items()}
        
    def get_game_data(self, player_id):
        result = {
            "player_id":player_id,
            "service_info":{
                "room_id": self.config.room_id,
                "participants": self._get_participants()
                "timestamp": self.statistics.timestamp,
                "exec_time_current": self.statistics.last_tick_execution_time,
                "exec_time_max": self.statistics.game_tick
            },
            "fleets": self.fleets,
            "entities": self.game_engine.get_entities()   
        }

        print(result)
        return result

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