import { useSelector } from "react-redux";
import "../styles/PlayersTable.css";


function PlayersTable() {
    const gameState = useSelector(
        state => state.game.gameState?.payload
    );

    const participants =
        gameState?.service_info?.participants ?? [];

    if (!gameState) {
        return (
            <div className="players-table empty">
                Waiting for game...
            </div>
        );
    }

    if (participants.length === 0) {
        return (
            <div className="players-table empty">
                No players
            </div>
        );
    }

    const sortedParticipants = [...participants].sort(
        (a, b) => b.points - a.points
    );

    return (
        <div className="players-table">
            <div className="players-table-header">
                <div>Player</div>
                <div>Points</div>
                <div>Status</div>
            </div>

            <div className="players-table-body">
                {sortedParticipants.map((participant, index) => (
                    <div
                        className="players-table-row"
                        key={index}
                    >
                        <div className="player-name">
                            <span
                                className="player-color"
                                style={{
                                    backgroundColor:
                                        participant.color
                                }}
                            />

                            <span>
                                {participant.name}
                            </span>
                        </div>

                        <div className="player-points">
                            {participant.points}
                        </div>

                        <div
                            className={
                                participant.is_ready
                                    ? "player-status ready"
                                    : "player-status waiting"
                            }
                        >
                            {participant.is_ready
                                ? "Ready"
                                : "Waiting"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


export default PlayersTable;