import { useState } from "react";
import { useSelector } from "react-redux";
import "../styles/RoomStatusWidget.css";


function RoomStatusWidget() {
    const [copied, setCopied] = useState(false);

    const serviceInfo = useSelector(
        state => state.game.gameState?.payload?.service_info
    );

    if (!serviceInfo) {
        return null;
    }

    const {
        room_id,
        speed,
        respawn,
        participants = [],
        exec_time_max,
        exec_time_current,
    } = serviceInfo;


    const handleCopyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(room_id);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1200);
        }
        catch (error) {
            console.error("Failed to copy room ID:", error);
        }
    };


    return (
        <div className="room-status-widget">

            <div className="room-status-row">
                <span className="room-status-label">
                    Room
                </span>

                <button
                    className="room-id"
                    onClick={handleCopyRoomId}
                    title="Copy room ID"
                >
                    {copied ? "Copied!" : room_id}
                </button>
            </div>


            <div className="room-status-row">
                <span className="room-status-label">
                    Speed
                </span>

                <span className="room-status-value">
                    {speed}
                </span>
            </div>


            <div className="room-status-row">
                <span className="room-status-label">
                    Respawn
                </span>

                <span className="room-status-value">
                    {respawn ? "On" : "Off"}
                </span>
            </div>


            <div className="room-status-row">
                <span className="room-status-label">
                    Players
                </span>

                <span className="room-status-value">
                    {participants.length}
                </span>
            </div>

            <div className="room-status-row">
                <span className="room-status-label">
                    Performance
                </span>

                <span className="room-status-value">
                    {exec_time_current.toFixed(2)}/{exec_time_max.toFixed(2)}/{(exec_time_current/exec_time_max).toFixed(2)}
                </span>
            </div>

        </div>
    );
}


export default RoomStatusWidget;