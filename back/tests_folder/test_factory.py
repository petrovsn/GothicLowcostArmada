import pytest
from modules.core.ship.vessel_class import VesselClass
from modules.core.ship.vessels.ship import Ship
from modules.core.ship.factory import ShipFactory


def test_create_ship():
    ship = ShipFactory.ship_from_template("Lunar")
    assert isinstance(ship, Ship)
    assert ship.vessel_class == VesselClass.CRUISER


if __name__ == "__main__":
    test_create_ship()