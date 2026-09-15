from enum import StrEnum


class VesselClass(StrEnum):
    BATTLESHIP = "battleship"
    CRUISER = "cruiser"
    ESCORT = "escort"
    BEAKON = "beakon"
    TORPEDOS = "torpedos"

    def is_capital(self):
        return self.value in [VesselClass.BATTLESHIP, VesselClass.CRUISER]
    
    def is_torpedos(self):
        return self.value == VesselClass.TORPEDOS



