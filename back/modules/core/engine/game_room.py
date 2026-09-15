import asyncio
import time
import traceback
from dataclasses import dataclass
from uuid import uuid4

from modules.core.engine.game_engine import GameEngine, FleetRoster
from modules.core.entities.commands import CommandType, CommonCommand
from modules.core.entities.participant import Bot, Participant, Player
from modules.core.entities.time import GAME_FPS
from modules.core.ship.commands import parse_ship_command
from modules.utils.colors import get_color
from modules.utils.names import get_name
from collections import defaultdict
from modules.utils.config_loader import ConfigLoader
from enum import StrEnum

@dataclass
class GameRoomConfig:
    room_id: str
    max_fleet_points: int


@dataclass
class GameRoomStats:
    timestamp: int
    game_tick: float
    last_tick_execution_time: float

class GameRoomPhase:
    PREPARATION = "preparation"
    BATTLE = "battle"


class GameRoom:
    def __init__(self, n_players: int, max_fleet_points: int):
        self.config = GameRoomConfig(
            room_id = uuid4().hex,
            max_fleet_points = max_fleet_points
        )

        self.statistics = GameRoomStats(
            timestamp = 0,
            game_tick = 1.0/ConfigLoader().get_fps(),
            last_tick_execution_time = 0.0
        )
        self.participants: dict[str, Participant] = {}
        
        self.game_engine: GameEngine = GameEngine()

        self.game_engine.set_spawn_points(n_players)

        self.current_phase = GameRoomPhase.PREPARATION

        self.rosters: dict[str,FleetRoster] = defaultdict(lambda x: FleetRoster(self.config.max_fleet_points))



    def start(self):
        self.game_loop_task = asyncio.create_task(self.game_loop())

    def stop(self):
        if self.game_loop_task is not None:
            self.game_loop_task.cancel()
            self.game_loop_task = None

    @property
    def room_id(self):
        return self.config.room_id

    def _get_used_colors(self):
        return [p.color for p in self.participants.values()]

    def add_bot(self):
        participant_id = uuid4().hex
        participant_color = get_color(self._get_used_colors())
        name = get_name(participant_id)
        self.participants[participant_id] = Bot(
            name=name,
            is_ready = True,
            color=participant_color
        )

        self.game_engine.add_bot(participant_id)

        self.rosters[participant_id].autofill()

        return participant_id


    def add_player(self) -> int:
        player_id = uuid4().hex
        player_color = get_color(self._get_used_colors())
        self.participants[player_id] = Player(
            name="UnknownPlayer",
            connector=asyncio.Queue(maxsize=1),
            is_ready = False,
            color=player_color
        )

        return player_id

    def name_player(self, player_id, player_name):
        self.participants[player_id].name = player_name

    def remove_player(self,player_id):
        self.participants.pop(player_id)
        self.game_engine.remove_participant(player_id)

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
        if self.current_phase == GameRoomPhase.PREPARATION:
            self._activate_battlefield()
            
        return True

    def _activate_battlefield(self):
        self.current_phase = GameRoomPhase.BATTLE
        self.game_engine.place_rosters(self.rosters)

    def handle_command(self, player_id, command: dict):
        new_command = CommonCommand(**command)
        match new_command.type:
            case CommandType.GAME_ROOM:
                self._handle_room_command(player_id, new_command)
            case CommandType.SHIP:
                ship_command = parse_ship_command(new_command)
                self.game_engine.proceed_ship_command(ship_command)
            case CommandType.ENGINE:
                self.game_engine.proceed_command(new_command)

    def _handle_room_command(self, player_id, command: CommonCommand):
        match command.action:
            case "pause":
                self.participants[player_id].is_ready = False
            case "resume":
                self.participants[player_id].is_ready = True
            case "setup_roster":
                if self.current_phase == GameRoomPhase.PREPARATION:
                    self._setup_roster(player_id, command.params)

    def _setup_roster(self, player_id, fleet_roster: list[str]):
        self.rosters[player_id].clear()
        for pattern_name in fleet_roster:
            self.rosters[player_id].add(pattern_name)
           
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
                "participants": self._get_participants(),
                "timestamp": self.statistics.timestamp,
                "exec_time_current": self.statistics.last_tick_execution_time,
                "exec_time_max": self.statistics.game_tick,
                "max_fleet_points": self.config.max_fleet_points,
                "current_phase": self.current_phase
            },
            "fleets": self.game_engine.fleets,
            "entities": self.game_engine.get_entities(),
            "player_fleet": self.game_engine.get_fleet_info(player_id)
        }

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
            self.statistics.last_tick_execution_time = exec_time
            await asyncio.sleep(max(0,self.statistics.game_tick-exec_time))

    def get_data_connector(self, player_id):
        return self.participants[player_id].connector