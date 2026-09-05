const WS_URL = import.meta.env.VITE_WS_URL || (
    window.location.protocol === "https:"
        ? `wss://${window.location.host}/snakes2`
        : `ws://${window.location.host}/snakes2`
);

export function create_connection(room_id, player_name) {
    if (!room_id) {
        throw new Error("room_id is required");
    }

    const url = `${WS_URL}/game/${room_id}`;

    const socket = new WebSocket(url);

    return {
        socket,

        send(data) {
            if (socket.readyState !== WebSocket.OPEN) {
                throw new Error("WebSocket is not open");
            }

            socket.send(
                typeof data === "string"
                    ? data
                    : JSON.stringify(data)
            );
        },

        close(code, reason) {
            socket.close(code, reason);
        },

        on_open(callback) {
            socket.addEventListener("open", () => {
                socket.send(JSON.stringify({
                    "set_player_name": player_name,
                }));
                callback()
            });
        },

        on_message(callback) {
            socket.addEventListener("message", (event) => {
                let data;

                try {
                    data = JSON.parse(event.data);
                } catch {
                    data = event.data;
                }

                callback(data);
            });
        },

        on_close(callback) {
            socket.addEventListener("close", callback);
        },

        on_error(callback) {
            socket.addEventListener("error", callback);
        },
    };
}