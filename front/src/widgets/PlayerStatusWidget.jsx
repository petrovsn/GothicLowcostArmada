import { useSelector } from "react-redux";

import * as service_controller from "../controllers/service_controller";

import "../styles/PlayerStatusWidget.css";


function PlayerStatusWidget() {
    const gameState = useSelector(
        state =>
            state.game.gameState?.payload
    );


    if (!gameState) {
        return null;
    }


    const playerId =
        gameState.player_id;

    const participant =
        gameState.service_info?.participants?.[
            playerId
        ];


    if (!participant) {
        return null;
    }


    const handleReady = () => {
        service_controller.resume();
    };


    const handlePause = () => {
        service_controller.pause();
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
