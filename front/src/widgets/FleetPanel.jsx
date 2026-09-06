import {
    useDispatch,
    useSelector,
} from "react-redux";

import { setSelectedShip } from "../store/gameSlice.js";

import "../styles/FleetPanel.css";


function FleetShipCard({
    ship,
    selected,
    onClick,
}) {
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
     * GameState contract:
     *
     * {
     *     player_id,
     *     service_info,
     *     player_fleet,
     *     entities: {
     *         ships,
     *         ordnance,
     *     },
     * }
     *
     * player_fleet contains ship UUIDs.
     */
    const playerFleet =
        gameState.player_fleet ?? [];


    const entities =
        gameState.entities ?? {};


    const ships =
        entities.ships ?? [];


    /*
     * Select only ships belonging
     * to the current player's fleet.
     */
    const playerShips =
        ships.filter(
            ship =>
                playerFleet.includes(
                    ship.uuid
                )
        );


    const handleShipClick = (
        ship
    ) => {
        const isAlreadySelected =
            ship.uuid ===
            selectedShipId;


        /*
         * First click:
         * select the ship.
         *
         * Second click:
         * center the camera on it.
         */
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
