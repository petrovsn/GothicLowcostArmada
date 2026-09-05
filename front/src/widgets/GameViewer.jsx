import { useSelector } from "react-redux";
import * as game_controller from "../controllers/game_controller";
import "../styles/GameViewer.css";


const DIRECTIONS = {
    1: "up",
    2: "right",
    3: "down",
    4: "left",
};


function getSegmentType(body, index) {
    const current = body[index];

    const previous = body[index - 1];
    const next = body[index + 1];

    // У хвоста есть только следующий сегмент.
    if (!previous && next) {
        if (next[0] !== current[0]) {
            return "horizontal";
        }

        if (next[1] !== current[1]) {
            return "vertical";
        }
    }

    // Если по какой-то причине есть только предыдущий.
    if (previous && !next) {
        if (previous[0] !== current[0]) {
            return "horizontal";
        }

        if (previous[1] !== current[1]) {
            return "vertical";
        }
    }

    // Обычный внутренний сегмент.
    if (previous && next) {
        const previousIsHorizontal =
            previous[1] === current[1];

        const nextIsHorizontal =
            next[1] === current[1];

        const previousIsVertical =
            previous[0] === current[0];

        const nextIsVertical =
            next[0] === current[0];

        // Оба соседа находятся слева/справа.
        if (previousIsHorizontal && nextIsHorizontal) {
            return "horizontal";
        }

        // Оба соседа находятся сверху/снизу.
        if (previousIsVertical && nextIsVertical) {
            return "vertical";
        }

        // Один сосед по X, второй по Y.
        return "turning-point";
    }

    return "horizontal";
}


function GameViewer() {
    const gameState = useSelector(
        state => state.game.gameState?.payload
    );

    if (!gameState) {
        return (
            <div className="game-viewer empty">
                Waiting for game...
            </div>
        );
    }

    const {
        world,
        snakes,
        player_id,
        service_info,
    } = gameState;

    const height = world?.length ?? 0;
    const width = world?.[0]?.length ?? 0;

    if (height === 0 || width === 0) {
        return (
            <div className="game-viewer empty">
                Empty world
            </div>
        );
    }


    /*
     * ============================================================
     * CURRENT PLAYER
     * ============================================================
     */

    const playerSnake = snakes?.[player_id];

    const isDead =
        playerSnake !== undefined &&
        playerSnake.alive === false;

    const respawnEnabled =
        service_info?.respawn === true;


    const handleRespawn = () => {
        game_controller.send_command("respawn");
    };


    /*
     * ============================================================
     * SNAKES
     * ============================================================
     */

    const snakeCells = new Map();


    Object.entries(snakes ?? {}).forEach(
        ([snakeId, snake]) => {

            if (!snake.body) {
                return;
            }

            snake.body.forEach(
                ([x, y], index) => {

                    const isHead =
                        index === snake.body.length - 1;

                    const segmentType =
                        isHead
                            ? "head"
                            : getSegmentType(
                                snake.body,
                                index
                            );

                    snakeCells.set(`${x}:${y}`, {
                        snakeId,

                        isHead,

                        segmentType,

                        direction: snake.direction,
                        color: snake.color,
                        alive: snake.alive,
                    });

                }
            );
        }
    );


    /*
     * ============================================================
     * CELLS
     * ============================================================
     */

    const cells = [];


    for (
        let visualY = 0;
        visualY < height;
        visualY++
    ) {
        const worldY = height - 1 - visualY;


        for (
            let x = 0;
            x < width;
            x++
        ) {

            const worldValue =
                world[worldY][x];

            const snake =
                snakeCells.get(`${x}:${worldY}`);


            let className = "game-cell";


            if (worldValue === 3) {
                className += " wall";
            }
            else if (worldValue === 2) {
                className += " apple";
            }
            else {
                className += " floor";
            }


            if (snake) {
                className += " snake";

                if (snake.isHead) {
                    className += " snake-head";
                }

                if (!snake.alive) {
                    className += " dead";
                }

                if (snake.segmentType === "horizontal") {
                    className += " horizontal";
                }

                if (snake.segmentType === "vertical") {
                    className += " vertical";
                }

                if (snake.segmentType === "turning-point") {
                    className += " turning-point";
                }
            }


            cells.push(
                <div
                    key={`${x}:${worldY}`}
                    className={className}
                >

                    {snake && (
                        snake.isHead
                            ? (
                                <div
                                    className={
                                        `snake-head-shape direction-${
                                            DIRECTIONS[
                                                snake.direction
                                            ]
                                        }`
                                    }
                                    style={{
                                        "--snake-color":
                                            snake.color,
                                    }}
                                />
                            )
                            : snake.segmentType === "turning-point"
                                ? (
                                    <div
                                        className="snake-turning-shape"
                                        style={{
                                            "--snake-color":
                                                snake.color,
                                        }}
                                    />
                                )
                                : (
                                    <div
                                        className="snake-body-shape"
                                        style={{
                                            "--snake-color":
                                                snake.color,
                                        }}
                                    />
                                )
                    )}

                </div>
            );
        }
    }


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <div className="game-viewer">

            <div
                className="game-board"
                style={{
                    "--board-width": width,
                    "--board-height": height,
                }}
            >
                {cells}
            </div>


            {isDead && (
                <div className="game-over-overlay">

                    <div className="game-over-content">

                        <div className="game-over-title">
                            DEAD
                        </div>


                        {respawnEnabled && (
                            <button
                                className="game-over-respawn-button"
                                onClick={handleRespawn}
                            >
                                Respawn
                            </button>
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}


export default GameViewer;