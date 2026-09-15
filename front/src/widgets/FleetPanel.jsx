import {
    useDispatch,
    useSelector,
} from "react-redux";

import { setSelectedShip } from "../store/gameSlice.js";

import "../styles/FleetPanel.css";

const SHIP_ICONS = {
    "escort": "▲",

}

function FleetShipCard({
    ship,
    selected,
    onClick,
}) {
    return (
        <button
            className={
                `fleet-ship-card ${selected
                    ? "selected"
                    : ""
                }`
            }
            onClick={onClick}
        >
            <div className={`fleet-ship-card-icon ${ship.vessel_class}`}>
                {ship.vessel_class === "escort" && (
                    <div className="ship-icon-escort">▲</div>
                )}

                {ship.vessel_class === "cruiser" && (
                    <div className="ship-icon-cruiser" />
                )}

                {ship.vessel_class === "battleship" && (
                    <div className="ship-icon-battleship">
                        <div className="ship-icon-battleship-line" />
                    </div>
                )}
            </div>

            <div className="fleet-ship-card-info">

                <div className="fleet-ship-card-name">
                    {ship.name}
                </div>

                <div className="fleet-ship-card-tier">
                    {ship.pattern}[{ship.vessel_class}]
                </div>

            </div>
        </button>
    );
}


function FleetPanel({
    onCenterShip,
}) {
    const dispatch = useDispatch();

    const gameState = useSelector(
        state =>
            state.game.gameState?.payload
    );

    const selectedShipId = useSelector(
        state =>
            state.game.selectedShipId
    );

    if (!gameState) {
        return null;
    }

    const playerId =
        gameState.player_id;

    const fleets =
        gameState.fleets ?? {};

    const ships =
        gameState.entities?.ships ?? [];

    const shipsById =
        Object.fromEntries(
            ships.map(
                ship => [
                    ship.uuid,
                    ship,
                ]
            )
        );

    const playerShipIds =
        fleets[playerId] ?? [];

    const playerShips =
        playerShipIds
            .map(
                shipId =>
                    shipsById[shipId]
            )
            .filter(Boolean);


    const handleShipClick = (
        ship
    ) => {
        const isAlreadySelected =
            ship.uuid ===
            selectedShipId;

        if (isAlreadySelected) {
            onCenterShip?.(
                ship.position
            );

            return;
        }

        dispatch(
            setSelectedShip(
                ship.uuid
            )
        );
    };


    return (
        <div className="fleet-panel">
            <div className="fleet-panel-ships">
                {playerShips.map(
                    ship => (
                        <FleetShipCard
                            key={ship.uuid}
                            ship={ship}
                            selected={
                                ship.uuid ===
                                selectedShipId
                            }
                            onClick={() =>
                                handleShipClick(
                                    ship
                                )
                            }
                        />
                    )
                )}
            </div>
        </div>
    );
}


export default FleetPanel;