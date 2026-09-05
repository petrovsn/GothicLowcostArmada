import { useSelector } from "react-redux";
import "../styles/GameViewer.css";


const DIRECTIONS = {
    1: "up",
    2: "right",
    3: "down",
    4: "left",
};


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

    const { world, snakes } = gameState;

    const height = world?.length ?? 0;
    const width = world?.[0]?.length ?? 0;

    if (height === 0 || width === 0) {
        return (
            <div className="game-viewer empty">
                Empty world
            </div>
        );
    }


    const snakeCells = new Map();


    Object.entries(snakes ?? {}).forEach(
        ([snakeId, snake]) => {
            snake.body.forEach(
                ([x, y], index) => {
                    snakeCells.set(`${x}:${y}`, {
                        snakeId,
                        isHead: index === snake.body.length - 1,
                        direction: snake.direction,
                        color: snake.color,
                        alive: snake.alive
                    });
                }
            );
        }
    );


    const cells = [];


    for (let visualY = 0; visualY < height; visualY++) {
        const worldY = height - 1 - visualY;

        for (let x = 0; x < width; x++) {
            const worldValue = world[worldY][x];

            const snake = snakeCells.get(
                `${x}:${worldY}`
            );

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
                                    className={`snake-head-shape direction-${DIRECTIONS[snake.direction]}`}
                                    style={{
                                        "--snake-color": snake.color,
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
        </div>
    );
}


export default GameViewer;