import {
    useDispatch,
    useSelector,
} from "react-redux";

import { setSelectedShip } from "../store/gameSlice.js";

import "../styles/FleetPanel.css";


function getReadyTorpedos(ship) {
    const mountingPoints =
        ship.weapons?.mounting_points ?? {};

    return Object.values(mountingPoints)
        .flat()
        .filter(
            weapon =>
                weapon.type === "torpedos" &&
                weapon.reloading === 0
        )
        .length;
}


function FleetShipCard({
    ship,
    selected,
    onClick,
}) {
    const engine =
        ship.engine ?? {};

    const torpedos =
        getReadyTorpedos(ship);

    return (
        <button
            className={
                `fleet-ship-card ${
                    selected
                        ? "selected"
                        : ""
                }`
            }
            onClick={onClick}
        >
            <div className="fleet-ship-card-header">

                <div
                    className={
                        `fleet-ship-card-icon ${ship.vessel_class}`
                    }
                >
                    {ship.vessel_class === "escort" && (
                        <div className="ship-icon-escort">
                            ▲
                        </div>
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

                <div className="fleet-ship-card-name">
                    {ship.name}
                </div>

                <div className="fleet-ship-card-class">
                    [{ship.vessel_class}]
                </div>

            </div>


            <div className="fleet-ship-card-stats">
                Speed: {engine.max_velocity ?? 0}
                &nbsp;&nbsp;
                Turn: {engine.max_ang_velocity ?? 0}
            </div>


            <div className="fleet-ship-card-torpedos">
                Torpedos:

                {Array.from(
                    { length: torpedos },
                    (_, index) => (
                        <span
                            key={index}
                            className="fleet-ship-card-torpedo"
                        >
                            ↑
                        </span>
                    )
                )}

                {torpedos === 0 && " —"}
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


    /*
     * player_fleet имеет структуру:
     *
     * {
     *     "ship_uuid_1": {...},
     *     "ship_uuid_2": {...},
     *     ...
     * }
     *
     * Поэтому берём Object.values().
     */
    const playerShips =
        Object.values(
            gameState.player_fleet ?? {}
        );


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
