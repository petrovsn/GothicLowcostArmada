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

import "../styles/GameViewer.css";


const VIEW_BOX_SIZE = 1000;
const VIEW_BOX_HALF = VIEW_BOX_SIZE / 2;

const CLICK_THRESHOLD = 10;

const SHIP_LENGTH = 1;
const SHIP_WIDTH = 0.67;
const SHIP_SELECTION_RADIUS = 0.5;

const GRID_STEP = 10;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 50;


function Ship({
    ship,
    selected,
}) {
    const {
        x,
        y,
        rotation,
    } = ship.position;

    const halfWidth =
        SHIP_WIDTH / 2;

    return (
        <>
            {selected && (
                <circle
                    cx={x}
                    cy={-y}
                    r={SHIP_SELECTION_RADIUS}
                    className="ship-selection"
                />
            )}

            <polygon
                points={`
                    0,${-SHIP_LENGTH / 2}
                    ${halfWidth},${SHIP_LENGTH / 2}
                    0,${SHIP_LENGTH / 3}
                    ${-halfWidth},${SHIP_LENGTH / 2}
                `}
                transform={`
                    translate(${x} ${-y})
                    rotate(${rotation})
                `}
                className="ship"
            />
        </>
    );
}


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

    const svgRef =
        useRef(null);


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

    const playerFleet =
        gameState.player_fleet ?? [];

    const playerShips =
        new Set(playerFleet);


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
                    SHIP_SELECTION_RADIUS &&
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


    const handleMouseUp = (
        event
    ) => {
        const drag =
            dragState.current;

        if (!drag) {
            return;
        }

        dragState.current = null;

        if (drag.moved) {
            return;
        }

        const worldPosition =
            getWorldPosition(event);

        const ship =
            findShipAtPosition(
                worldPosition
            );


        if (!ship) {
            if (selectedShipId) {
                orders_controller.move_ship(
                    selectedShipId,
                    worldPosition
                );
            }

            return;
        }


        const isPlayerShip =
            playerShips.has(
                ship.uuid
            );


        if (isPlayerShip) {
            dispatch(
                setSelectedShip(
                    ship.uuid
                )
            );

            return;
        }


        if (selectedShipId) {
            orders_controller.attack_ship(
                selectedShipId,
                ship.uuid
            );
        }
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
                        ship => (
                            <Ship
                                key={ship.uuid}
                                ship={ship}
                                selected={
                                    ship.uuid ===
                                    selectedShipId
                                }
                            />
                        )
                    )}

                </g>

            </svg>

        </div>
    );
}


export default GameViewer;
