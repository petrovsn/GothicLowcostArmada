from enum import StrEnum


class VesselClass(StrEnum):
    BATTLESHIP = "battleship"
    CRUISER = "cruiser"
    ESCORT = "escort"
    BEAKON = "beakon"
    ORDNANCE = "ordnance"

    def is_capital(self):
        return self.value in [VesselClass.BATTLESHIP, VesselClass.CRUISER]
    
    def is_ordnance(self):
        return self.value == VesselClass.ORDNANCE



