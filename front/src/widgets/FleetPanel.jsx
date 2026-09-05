import { useDispatch, useSelector } from "react-redux";
import { setSelectedShip } from "../store/gameSlice.js";
import "../styles/FleetPanel.css";

function FleetShipCard({ ship, selected, onClick }) {
    return (
        <button
            className={`fleet-ship-card ${selected ? "selected" : ""}`}
            onClick={onClick}
        >
            <div className="fleet-ship-card-icon">
                ▲
            </div>

            <div className="fleet-ship-card-info">
                <div className="fleet-ship-card-name">
                    {ship.name}
                </div>

                <div className="fleet-ship-card-tier">
                    {ship.tier}
                </div>
            </div>
        </button>
    );
}

function FleetPanel() {
    const dispatch = useDispatch();

    const gameState = useSelector(
        state => state.game.gameState?.payload
    );

    const selectedShipId = useSelector(
        state => state.game.selectedShipId
    );

    if (!gameState) {
        return null;
    }

    const playerFleet = gameState.player_fleet ?? [];
    const entities = gameState.entities ?? {};

    const ships = playerFleet
        .map(shipId => entities[shipId])
        .filter(Boolean);

    const handleShipClick = (shipId) => {
        dispatch(setSelectedShip(shipId));
    };

    return (
        <div className="fleet-panel">
            <div className="fleet-panel-ships">
                {ships.map(ship => (
                    <FleetShipCard
                        key={ship.name}
                        ship={ship}
                        selected={ship.name === selectedShipId}
                        onClick={() => handleShipClick(ship.name)}
                    />
                ))}
            </div>
        </div>
    );
}

export default FleetPanel;
