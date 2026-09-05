import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { setSelectedShip } from "../store/gameSlice.js";
import * as orders_controller from "../controllers/orders_controller.js";

import "../styles/GameViewer.css";


const CLICK_THRESHOLD = 10;
const SHIP_SELECTION_RADIUS = 30;


function Ship({ ship, selected }) {
    const {
        x,
        y,
        rotation,
    } = ship.position;

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
                points="0,-15 10,15 0,10 -10,15"
                transform={`translate(${x} ${-y}) rotate(${rotation})`}
                className="ship"
            />
        </>
    );
}


function GameViewer() {
    const dispatch = useDispatch();

    const gameState = useSelector(
        state => state.game.gameState?.payload
    );

    const selectedShipId = useSelector(
        state => state.game.selectedShipId
    );

    const [camera, setCamera] = useState({
        x: 0,
        y: 0,
        zoom: 1,
    });

    const dragState = useRef(null);
    const svgRef = useRef(null);


    useEffect(() => {
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
                    5,
                    Math.max(
                        0.2,
                        previous.zoom * zoomFactor
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
    }, []);


    if (!gameState) {
        return (
            <div className="game-viewer empty">
                Waiting for game...
            </div>
        );
    }


    const entities = gameState.entities ?? {};
    const playerFleet = gameState.player_fleet ?? [];

    const playerShips = new Set(playerFleet);


    const getWorldPosition = (event) => {
        const svg = svgRef.current;

        const rect =
            svg.getBoundingClientRect();

        const screenX =
            event.clientX - rect.left;

        const screenY =
            event.clientY - rect.top;

        const viewBoxWidth = 1000;
        const viewBoxHeight = 1000;

        const svgX =
            (screenX / rect.width) *
            viewBoxWidth -
            500;

        const svgY =
            (screenY / rect.height) *
            viewBoxHeight -
            500;

        return {
            x: svgX / camera.zoom + camera.x,
            y: -(svgY / camera.zoom + camera.y),
        };
    };


    const findShipAtPosition = (position) => {
        let closestShip = null;
        let closestDistance = Infinity;

        for (const ship of Object.values(entities)) {
            const dx =
                ship.position.x -
                position.x;

            const dy =
                ship.position.y -
                position.y;

            const distance = Math.sqrt(
                dx * dx +
                dy * dy
            );

            if (
                distance <= SHIP_SELECTION_RADIUS &&
                distance < closestDistance
            ) {
                closestShip = ship;
                closestDistance = distance;
            }
        }

        return closestShip;
    };


    const handleMouseDown = (event) => {
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


    const handleMouseMove = (event) => {
        const drag = dragState.current;

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

        const distance = Math.sqrt(
            totalDx * totalDx +
            totalDy * totalDy
        );

        if (distance >= CLICK_THRESHOLD) {
            drag.moved = true;
        }

        if (drag.moved) {
            setCamera(previous => ({
                ...previous,

                x: previous.x -
                    dx / previous.zoom,

                y: previous.y +
                    dy / previous.zoom,
            }));
        }

        drag.lastX = event.clientX;
        drag.lastY = event.clientY;
    };


    const handleMouseUp = (event) => {
        const drag = dragState.current;

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
            findShipAtPosition(worldPosition);

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
            playerShips.has(ship.name);

        if (isPlayerShip) {
            dispatch(
                setSelectedShip(ship.name)
            );

            return;
        }

        if (selectedShipId) {
            orders_controller.attack_ship(
                selectedShipId,
                ship.name
            );
        }
    };


    const handleMouseLeave = () => {
        dragState.current = null;
    };


    return (
        <div className="game-viewer">
            <svg
                ref={svgRef}
                className="game-board"
                viewBox="-500 -500 1000 1000"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <g
                    transform={`
                        translate(${-camera.x} ${camera.y})
                        scale(${camera.zoom})
                    `}
                >
                    {Object.values(entities).map(ship => (
                        <Ship
                            key={ship.name}
                            ship={ship}
                            selected={
                                ship.name === selectedShipId
                            }
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
}


export default GameViewer;
