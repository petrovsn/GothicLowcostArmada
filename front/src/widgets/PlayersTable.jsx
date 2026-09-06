import { useSelector } from "react-redux";

import "../styles/PlayersTable.css";


function PlayersTable() {
    const gameState = useSelector(
        state => state.game.gameState?.payload
    );

    const participants =
        gameState?.participants ?? {};

    if (!gameState) {
        return (
            <div className="players-table empty">
                Waiting for game...
            </div>
        );
    }

    const participantEntries =
        Object.entries(participants);

    if (participantEntries.length === 0) {
        return (
            <div className="players-table empty">
                No players
            </div>
        );
    }

    const sortedParticipants =
        participantEntries.sort(
            ([, a], [, b]) =>
                b.points - a.points
        );

    return (
        <div className="players-table">
            <div className="players-table-header">
                <div>Player</div>
                <div>Points</div>
                <div>Status</div>
            </div>

            <div className="players-table-body">
                {sortedParticipants.map(
                    ([
                        participantId,
                        participant,
                    ]) => (
                        <div
                            className="players-table-row"
                            key={participantId}
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
                    )
                )}
            </div>
        </div>
    );
}


export default PlayersTable;
