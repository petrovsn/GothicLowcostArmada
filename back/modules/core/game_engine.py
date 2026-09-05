from modules.core.game_rooms.core import GameRoom

class GameEngine:
    @staticmethod
    def get_room(room_type, *args, **kwargs):
        return GameRoom(*args, **kwargs)