import {
    useSelector,
} from "react-redux";

import * as orders_controller from "../controllers/orders_controller.js";

import "../styles/ShipControlPanel.css";


const MOUNTING_POINTS = {
    PROW: "prow",
    PORT: "port",
    STARBOARD: "starboard",
    DORSAL: "dorsal",
    KEEL: "keel",
};


function WeaponsTable({
    weapons,
}) {
    if (weapons.length === 0) {
        return (
            <div className="ship-sector-empty">
                Нет орудий
            </div>
        );
    }


    return (
        <table className="ship-weapons-table">

            <thead>
                <tr>
                    <th>Тип</th>
                    <th>Дальн.</th>
                    <th>Мощн.</th>
                </tr>
            </thead>

            <tbody>
                {weapons.map(
                    weapon => (
                        <tr key={weapon.uuid}>

                            <td>
                                {weapon.type}
                            </td>

                            <td>
                                {weapon.range}
                            </td>

                            <td>
                                {weapon.power}
                            </td>

                        </tr>
                    )
                )}
            </tbody>

        </table>
    );
}


function SectorPanel({
    title,
    armor,
    weapons,
}) {
    return (
        <div className="ship-sector">

            <div className="ship-sector-header">

                <span className="ship-sector-title">
                    {title}
                </span>

                <span className="ship-sector-armor">
                    {armor}
                </span>

            </div>


            <WeaponsTable
                weapons={weapons}
            />

        </div>
    );
}


function ShipControlPanel() {
    const gameState = useSelector(
        state =>
            state.game.gameState?.payload
    );


    const selectedShipId = useSelector(
        state =>
            state.game.selectedShipId
    );


    if (
        !gameState ||
        !selectedShipId
    ) {
        return null;
    }


    const playerFleet =
        gameState.player_fleet ?? {};


    const ship =
        playerFleet[selectedShipId];


    if (!ship) {
        return null;
    }


    const defence =
        ship.defence ?? {};


    const armor =
        defence.armor ?? {};


    const engine =
        ship.engine ?? {};


    const mountingPoints =
        ship.weapons?.mounting_points ?? {};


    const prowWeapons =
        mountingPoints[
            MOUNTING_POINTS.PROW
        ] ?? [];


    const portWeapons =
        mountingPoints[
            MOUNTING_POINTS.PORT
        ] ?? [];


    const starboardWeapons =
        mountingPoints[
            MOUNTING_POINTS.STARBOARD
        ] ?? [];


    const dorsalWeapons =
        mountingPoints[
            MOUNTING_POINTS.DORSAL
        ] ?? [];


    const keelWeapons =
        mountingPoints[
            MOUNTING_POINTS.KEEL
        ] ?? [];


    const handleFullSpeed = () => {
        orders_controller.set_full_speed(
            selectedShipId
        );
    };


    const handleHalfSpeed = () => {
        orders_controller.set_half_speed(
            selectedShipId
        );
    };


    const handleAutomatic = () => {
        orders_controller.set_automatic_speed(
            selectedShipId
        );
    };


    const handleClearTarget = () => {
        orders_controller.clear_ship_target(
            selectedShipId
        );
    };


    const handleFireAtWill = () => {
        orders_controller.set_fire_at_will(
            selectedShipId
        );
    };


    const handleCeaseFire = () => {
        orders_controller.set_cease_fire(
            selectedShipId
        );
    };


    const handleClearFireTarget = () => {
        orders_controller.clear_fire_target(
            selectedShipId
        );
    };


    return (
        <div className="ship-control-panel">

            <div className="ship-control-header">

                <div className="ship-control-name">
                    {ship.name}
                </div>

                <div className="ship-control-tier">
                    {ship.tier}
                </div>

            </div>


            <div className="ship-sectors">

                <div className="ship-sector-row">

                    <SectorPanel
                        title="НОС"
                        armor={
                            armor.front ??
                            armor["front"] ??
                            0
                        }
                        weapons={
                            prowWeapons
                        }
                    />

                </div>


                <div className="ship-sector-row">

                    <SectorPanel
                        title="ЛЕВЫЙ БОРТ"
                        armor={
                            armor.left ??
                            armor["left"] ??
                            0
                        }
                        weapons={
                            portWeapons
                        }
                    />

                    <SectorPanel
                        title="ПРАВЫЙ БОРТ"
                        armor={
                            armor.right ??
                            armor["right"] ??
                            0
                        }
                        weapons={
                            starboardWeapons
                        }
                    />

                </div>


                <div className="ship-sector-row">

                    <SectorPanel
                        title="КОРМА"
                        armor={
                            armor.rear ??
                            armor["rear"] ??
                            0
                        }
                        weapons={[
                            ...keelWeapons,
                            ...dorsalWeapons,
                        ]}
                    />

                </div>

            </div>


            <div className="ship-engine-panel">

                <div className="ship-control-section-title">
                    ДВИГАТЕЛЬ
                </div>

                <div className="ship-engine-thrust">
                    Тяга: {engine.thrust ?? 0}
                </div>

                <div className="ship-engine-controls">

                    <button
                        type="button"
                        onClick={
                            handleFullSpeed
                        }
                    >
                        1
                    </button>

                    <button
                        type="button"
                        onClick={
                            handleHalfSpeed
                        }
                    >
                        0.5
                    </button>

                    <button
                        type="button"
                        onClick={
                            handleAutomatic
                        }
                    >
                        auto
                    </button>

                    <button
                        type="button"
                        onClick={
                            handleClearTarget
                        }
                    >
                        clear target
                    </button>

                </div>

            </div>


            <div className="ship-weapons-control">

                <div className="ship-control-section-title">
                    ОРУДИЯ
                </div>

                <div className="ship-weapons-controls">

                    <button
                        type="button"
                        onClick={
                            handleFireAtWill
                        }
                    >
                        at will
                    </button>

                    <button
                        type="button"
                        onClick={
                            handleCeaseFire
                        }
                    >
                        cease
                    </button>

                    <button
                        type="button"
                        onClick={
                            handleClearFireTarget
                        }
                    >
                        clear target
                    </button>

                </div>

            </div>

        </div>
    );
}


export default ShipControlPanel;
