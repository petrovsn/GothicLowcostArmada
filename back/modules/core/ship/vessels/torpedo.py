from queue import Queue

from modules.core.engine.game_events import FireEvent, VesselDeathEvent
from modules.core.ship.components.weaponry import WeaponDamage
from modules.core.ship.perception import ShipPerception
from modules.core.ship.vessel_class import VesselClass
from modules.core.ship.vessels.engineed_vessel import EngineedVessel


class Torpedo(EngineedVessel):
    def __init__(self, owner_id: str, power: int, events_queue: Queue = None):
        super().__init__(events_queue)
        self.owner_id = owner_id
        self.power = power
        self.perception: ShipPerception = ShipPerception(allied_entities={}, enemy_entities={})

    def update_perception(self, new_perception: ShipPerception):
        self.perception = new_perception

    def update_decisions(self):
        for entity_id, entity_info in self.perception.enemy_entities.items():
            if entity_info.position.distance<2:
                self.events_queue.put(FireEvent(
                    initiator_id=self.uuid,
                    target_id=entity_id,
                    source=self.position,
                    damage=WeaponDamage(MACRO=0, LASERS=0, TORPEDOS=self.power)
                ))
                self.events_queue.put(VesselDeathEvent(
                    initiator_id=self.uuid,
                    target_id=self.uuid,
                    position=self.position
                ))

    @property
    def position(self):
        return self._position

    def as_dict(self):
        return {
            "uuid": self.uuid,
            "vessel_class": VesselClass.TORPEDOS,
            "is_active": True,
            "position": self.position.as_dict(),
        }
