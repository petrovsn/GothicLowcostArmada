import { useSelector } from "react-redux";

import * as service_controller from "../controllers/service_controller";
import HelpPopup from "./HelpPopup.jsx";
import "../styles/PlayerStatusWidget.css";


function PlayerStatusWidget({
    roster = [],
}) {
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

    const currentPhase =
        gameState.service_info?.current_phase;


    if (!participant) {
        return null;
    }


    const handleReady = () => {
        if (currentPhase === "preparation") {
            service_controller.setup_roster(
                roster
            );
        }

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

            <div className="player-ready-button_layer">

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
            <HelpPopup/>
            </div>
        </div>
    );
}


export default PlayerStatusWidget;