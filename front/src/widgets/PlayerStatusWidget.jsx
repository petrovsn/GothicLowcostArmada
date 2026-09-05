import { useSelector } from "react-redux";
import * as game_controller from "../controllers/game_controller";
import "../styles/PlayerStatusWidget.css";


function PlayerStatusWidget() {
    const gameState = useSelector(
        state => state.game.gameState?.payload
    );

    if (!gameState) {
        return null;
    }

    const playerId = gameState.player_id;

    const snake = gameState.snakes?.[playerId];

    if (!snake) {
        return null;
    }

    const participant =
        gameState.service_info?.participants?.find(
            participant =>
                participant.color === snake.color
        );

    if (!participant) {
        return null;
    }


    const handleReady = () => {
        game_controller.send_command("ready");
    };


    return (
        <div className="player-status-widget">

            <div className="player-status-header">

                <div
                    className="player-status-color"
                    style={{
                        backgroundColor: snake.color,
                    }}
                />

                <div className="player-status-name">
                    {participant.name}
                </div>

            </div>


            <div className="player-status-stats">

                <div className="player-status-stat">
                    <span className="player-status-label">
                        HP
                    </span>

                    <span className="player-status-value">
                        {snake.hp}
                    </span>
                </div>


                <div className="player-status-stat">
                    <span className="player-status-label">
                        Points
                    </span>

                    <span className="player-status-value">
                        {participant.points}
                    </span>
                </div>

            </div>


            <button
                className="player-ready-button"
                onClick={handleReady}
                disabled={participant.is_ready}
            >
                {participant.is_ready
                    ? "Ready!"
                    : "Ready!"}
            </button>

        </div>
    );
}


export default PlayerStatusWidget;