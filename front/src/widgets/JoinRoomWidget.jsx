import { useState } from "react";
import * as game_controller from "../controllers/game_controller";
import "../styles/JoinRoomWidget.css";


function JoinRoomWidget({ onConnectionChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [playerName, setPlayerName] = useState("");
    const [roomId, setRoomId] = useState("");


    const handleOpen = () => {
        setError(null);
        setIsOpen(true);

        if (onConnectionChange) {
            onConnectionChange(false);
        }
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError(null);

        try {
            await game_controller.connect_to_room(
                roomId,
                playerName,
                () => {
                    if (onConnectionChange) {
                        onConnectionChange(true);
                    }
                }
            );

            setIsOpen(false);
        }
        catch (error) {
            console.error(error);

            setError(
                error.detail?.detail ??
                error.message ??
                "Failed to join room"
            );
        }
        finally {
            setLoading(false);
        }
    };


    if (!isOpen) {
        return (
            <button
                className="create-room-button"
                onClick={handleOpen}
            >
                Join room
            </button>
        );
    }


    return (
        <div className="join-room-overlay">
            <div className="join-room-widget">

                <form
                    className="join-room-form"
                    onSubmit={handleSubmit}
                >
                    <h2>Join room</h2>


                    <label>
                        Nickname

                        <input
                            type="text"
                            name="playerName"
                            value={playerName}
                            onChange={(event) =>
                                setPlayerName(event.target.value)
                            }
                            autoComplete="off"
                            autoFocus
                            required
                        />
                    </label>


                    <label>
                        Room ID

                        <input
                            type="text"
                            name="roomId"
                            value={roomId}
                            onChange={(event) =>
                                setRoomId(event.target.value)
                            }
                            autoComplete="off"
                            required
                        />
                    </label>


                    {error && (
                        <div className="join-room-error">
                            {error}
                        </div>
                    )}


                    <div className="join-room-actions">

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !playerName.trim() ||
                                !roomId.trim()
                            }
                        >
                            {loading
                                ? "Connecting..."
                                : "Join room"}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}


export default JoinRoomWidget;