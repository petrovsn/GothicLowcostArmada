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

    const participant =
        gameState.service_info?.participants?.[0];

    if (!participant) {
        return null;
    }

    const handleReady = () => {
        game_controller.send_command("ready");
    };

    const handlePause = () => {
        game_controller.send_command("pause");
    };

    return (
        <div className="player-status-widget">
            <div className="player-status-name">
                {participant.name}
            </div>

            {!participant.is_ready ? (
                <button
                    className="player-ready-button"
                    onClick={handleReady}
                >
                    Ready
                </button>
            ) : (
                <button
                    className="player-ready-button"
                    onClick={handlePause}
                >
                    Pause
                </button>
            )}
        </div>
    );
}

export default PlayerStatusWidget;
