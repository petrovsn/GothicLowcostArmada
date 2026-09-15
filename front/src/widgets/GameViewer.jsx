import {
    useEffect,
    useRef,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { setSelectedShip } from "../store/gameSlice.js";
import * as orders_controller from "../controllers/orders_controller.js";

import ShipIcon, {
    TIER_CONFIG,
} from "./ShipIcon.jsx";

import "../styles/GameViewer.css";
import EffectsLayer from "./EffectsLayer.jsx";
import useEffects from "./useEffects.js";

const VIEW_BOX_SIZE = 1000;
const VIEW_BOX_HALF = VIEW_BOX_SIZE / 2;

const CLICK_THRESHOLD = 10;
const DOUBLE_CLICK_DELAY = 200;

const SHIP_SELECTION_RADIUS = 0.5;

const GRID_STEP = 10;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 50;


function CoordinateGrid({
    camera,
}) {
    const halfView =
        VIEW_BOX_HALF /
        camera.zoom;

    const minWorldX =
        Math.floor(
            (
                camera.x -
                halfView
            ) / GRID_STEP
        ) * GRID_STEP;

    const maxWorldX =
        Math.ceil(
            (
                camera.x +
                halfView
            ) / GRID_STEP
        ) * GRID_STEP;

    const minWorldY =
        Math.floor(
            (
                camera.y -
                halfView
            ) / GRID_STEP
        ) * GRID_STEP;

    const maxWorldY =
        Math.ceil(
            (
                camera.y +
                halfView
            ) / GRID_STEP
        ) * GRID_STEP;

    const lines = [];

    for (
        let x = minWorldX;
        x <= maxWorldX;
        x += GRID_STEP
    ) {
        lines.push(
            <line
                key={`vertical-${x}`}
                x1={x}
                y1={-maxWorldY}
                x2={x}
                y2={-minWorldY}
            />
        );
    }

    for (
        let y = minWorldY;
        y <= maxWorldY;
        y += GRID_STEP
    ) {
        const svgY = -y;

        lines.push(
            <line
                key={`horizontal-${y}`}
                x1={minWorldX}
                y1={svgY}
                x2={maxWorldX}
                y2={svgY}
            />
        );
    }

    return (
        <g className="coordinate-grid">
            {lines}
        </g>
    );
}


function GameViewer({
    camera,
    setCamera,
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

    const dragState =
        useRef(null);

    const clickTimer =
        useRef(null);

    const svgRef =
        useRef(null);

    const {
        effects,
        addEffect,
        addFireEffect,
        addDeathEffect,
    } = useEffects();


    useEffect(() => {
        if (!gameState) {
            return;
        }

        const events =
            gameState.entities?.events ?? [];

        for (const event of events) {
            addFireEffect(event);
            addDeathEffect(event);
        }
    }, [
        gameState,
        addFireEffect,
        addDeathEffect,
    ]);


    useEffect(() => {
        if (!gameState) {
            return;
        }

        const svg = svgRef.current;

        if (!svg) {
            return;
        }

        const handleWheel = (event) => {
            event.preventDefault();

            const zoomFactor =
                event.deltaY < 0
                    ? 1.1
                    : 0.9;

            setCamera(previous => ({
                ...previous,

                zoom: Math.min(
                    MAX_ZOOM,
                    Math.max(
                        MIN_ZOOM,
                        previous.zoom *
                        zoomFactor
                    )
                ),
            }));
        };

        svg.addEventListener(
            "wheel",
            handleWheel,
            {
                passive: false,
            }
        );

        return () => {
            svg.removeEventListener(
                "wheel",
                handleWheel
            );
        };
    }, [
        Boolean(gameState),
        setCamera,
    ]);


    useEffect(() => {
        return () => {
            if (clickTimer.current) {
                clearTimeout(
                    clickTimer.current
                );

                clickTimer.current = null;
            }
        };
    }, []);


    if (!gameState) {
        return (
            <div className="game-viewer empty">
                Waiting for game...
            </div>
        );
    }


    const entities =
        gameState.entities ?? {};

    const ships =
        entities.ships ?? [];

    const fleets =
        gameState.fleets ?? {};

    const participants =
        gameState.service_info?.participants ?? {};

    const playerId =
        gameState.player_id;


    const shipFleetMap = {};

    for (const [
        participantId,
        shipIds,
    ] of Object.entries(fleets)) {
        for (const shipId of shipIds) {
            shipFleetMap[shipId] =
                participantId;
        }
    }


    const getShipColor = (
        shipId
    ) => {
        const participantId =
            shipFleetMap[shipId];

        return participants[
            participantId
        ]?.color;
    };


    const getWorldPosition = (
        event
    ) => {
        const svg =
            svgRef.current;

        if (!svg) {
            return {
                x: 0,
                y: 0,
            };
        }

        const rect =
            svg.getBoundingClientRect();

        const screenX =
            event.clientX -
            rect.left;

        const screenY =
            event.clientY -
            rect.top;

        const svgX =
            (
                screenX /
                rect.width
            ) *
            VIEW_BOX_SIZE -
            VIEW_BOX_HALF;

        const svgY =
            (
                screenY /
                rect.height
            ) *
            VIEW_BOX_SIZE -
            VIEW_BOX_HALF;

        return {
            x:
                svgX /
                camera.zoom +
                camera.x,

            y:
                camera.y -
                svgY /
                camera.zoom,
        };
    };


    const findShipAtPosition = (
        position
    ) => {
        let closestShip = null;

        let closestDistance =
            Infinity;

        for (
            const ship of ships
        ) {
            const tier =
                ship.tier ??
                ship.class ??
                "cruiser";

            const shipRadius =
                TIER_CONFIG[tier]?.size ??
                TIER_CONFIG.cruiser.size;

            const dx =
                ship.position.x -
                position.x;

            const dy =
                ship.position.y -
                position.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance <=
                shipRadius / 2 &&
                distance <
                closestDistance
            ) {
                closestShip = ship;

                closestDistance =
                    distance;
            }
        }

        return closestShip;
    };


    const handleMouseDown = (
        event
    ) => {
        if (event.button !== 0) {
            return;
        }

        dragState.current = {
            startX: event.clientX,
            startY: event.clientY,

            lastX: event.clientX,
            lastY: event.clientY,

            moved: false,
        };
    };


    const handleMouseMove = (
        event
    ) => {
        const drag =
            dragState.current;

        if (!drag) {
            return;
        }

        const dx =
            event.clientX -
            drag.lastX;

        const dy =
            event.clientY -
            drag.lastY;

        const totalDx =
            event.clientX -
            drag.startX;

        const totalDy =
            event.clientY -
            drag.startY;

        const distance =
            Math.sqrt(
                totalDx * totalDx +
                totalDy * totalDy
            );

        if (
            distance >=
            CLICK_THRESHOLD
        ) {
            drag.moved = true;
        }

        if (drag.moved) {
            setCamera(previous => ({
                ...previous,

                x:
                    previous.x -
                    dx /
                    previous.zoom,

                y:
                    previous.y +
                    dy /
                    previous.zoom,
            }));
        }

        drag.lastX =
            event.clientX;

        drag.lastY =
            event.clientY;
    };


    const handleClick = (
        event
    ) => {
        const worldPosition =
            getWorldPosition(event);

        const ship =
            findShipAtPosition(
                worldPosition
            );


        if (!ship) {
            if (selectedShipId) {
                const selectedShip =
                    ships.find(
                        currentShip =>
                            currentShip.uuid ===
                            selectedShipId
                    );

                if (selectedShip) {
                    addEffect(
                        "move",
                        selectedShip.position,
                        worldPosition
                    );
                }

                orders_controller.move_ship(
                    selectedShipId,
                    worldPosition
                );
            }

            return;
        }


        const shipOwnerId =
            shipFleetMap[
                ship.uuid
            ];

        const isPlayerShip =
            shipOwnerId === playerId;


        if (isPlayerShip) {
            dispatch(
                setSelectedShip(
                    ship.uuid
                )
            );

            return;
        }


        if (selectedShipId) {
            const selectedShip =
                ships.find(
                    currentShip =>
                        currentShip.uuid ===
                        selectedShipId
                );

            if (selectedShip) {
                addEffect(
                    "attack",
                    selectedShip.position,
                    ship.position
                );
            }

            orders_controller.attack_ship(
                selectedShipId,
                ship.uuid
            );
        }
    };


    const handleDoubleClick = (
        event
    ) => {
        if (!selectedShipId) {
            return;
        }

        const worldPosition =
            getWorldPosition(event);

        const ship =
            findShipAtPosition(
                worldPosition
            );

        // Торпеды запускаются только
        // по свободному полю.
        if (ship) {
            return;
        }

        orders_controller.launch_torpedos(
            selectedShipId,
            worldPosition
        );
    };


    const handleMouseUp = (
        event
    ) => {
        const drag =
            dragState.current;

        if (!drag) {
            return;
        }

        dragState.current = null;

        // Это был drag камеры,
        // а не клик.
        if (drag.moved) {
            return;
        }


        // Второй клик в пределах
        // DOUBLE_CLICK_DELAY означает
        // двойной клик.
        if (clickTimer.current) {
            clearTimeout(
                clickTimer.current
            );

            clickTimer.current = null;

            handleDoubleClick(event);

            return;
        }


        // Первый клик пока не выполняем.
        // Ждём, не последует ли второй.
        clickTimer.current =
            setTimeout(() => {
                clickTimer.current = null;

                handleClick(event);
            }, DOUBLE_CLICK_DELAY);
    };


    const handleMouseLeave = () => {
        dragState.current = null;
    };


    const cameraTransform = `
        matrix(
            ${camera.zoom}
            0
            0
            ${camera.zoom}
            ${-camera.x * camera.zoom}
            ${camera.y * camera.zoom}
        )
    `;


    return (
        <div className="game-viewer">

            <svg
                ref={svgRef}
                className="game-board"
                viewBox="-500 -500 1000 1000"
                onMouseDown={
                    handleMouseDown
                }
                onMouseMove={
                    handleMouseMove
                }
                onMouseUp={
                    handleMouseUp
                }
                onMouseLeave={
                    handleMouseLeave
                }
            >

                <g
                    transform={
                        cameraTransform
                    }
                >

                    <CoordinateGrid
                        camera={camera}
                    />

                    {ships.map(
                        ship => {
                            const isSelected =
                                ship.uuid ===
                                selectedShipId;

                            const vessel_class =
                                ship.vessel_class ??
                                "cruiser";

                            return (
                                <g
                                    key={ship.uuid}
                                >

                                    {isSelected && (
                                        <circle
                                            cx={
                                                ship.position.x
                                            }
                                            cy={
                                                -ship.position.y
                                            }
                                            r={
                                                SHIP_SELECTION_RADIUS
                                            }
                                            className="ship-selection"
                                        />
                                    )}

                                    <ShipIcon
                                        vessel_class={
                                            vessel_class
                                        }
                                        x={
                                            ship.position.x
                                        }
                                        y={
                                            -ship.position.y
                                        }
                                        rotation={
                                            ship.position.rotation
                                        }
                                        color={
                                            getShipColor(
                                                ship.uuid
                                            )
                                        }
                                    />

                                </g>
                            );
                        }
                    )}

                    <EffectsLayer
                        effects={effects}
                    />

                </g>

            </svg>

        </div>
    );
}


export default GameViewer;