import { useState } from "react";
import { useSelector } from "react-redux";
import "../styles/RoomStatusWidget.css";


function RoomStatusWidget() {
    const [copied, setCopied] =
        useState(false);

    const serviceInfo =
        useSelector(
            state =>
                state.game.gameState?.payload?.service_info
        );

    const gameStateFps =
        useSelector(
            state =>
                state.game.gameStateFps
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
            await navigator.clipboard.writeText(
                room_id
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1200);
        }
        catch (error) {
            console.error(
                "Failed to copy room ID:",
                error
            );
        }
    };


    return (
        <div className="room-status-widget">

            <div className="room-status-row">
                <span className="room-status-label">
                    Room
                </span>

                <span
                    className="room-status-value room-id"
                    onClick={handleCopyRoomId}
                    title="Copy room ID"
                >
                    {copied ? "Copied!" : room_id}
                </span>
            </div>

            <div className="room-status-row">
                <span className="room-status-label">
                    Performance
                </span>

                <span className="room-status-value">
                    {exec_time_current.toFixed(2)}
                    /
                    {exec_time_max.toFixed(2)}
                    /
                    {(exec_time_current / exec_time_max).toFixed(2)}
                    /
                    {gameStateFps !== null
                        ? gameStateFps.toFixed(1)
                        : "—"
                    }
                </span>
            </div>
        </div>
    );
}


export default RoomStatusWidget;
