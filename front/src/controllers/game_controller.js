import { create_room } from "../network/backend_api.js";
import { create_connection } from "../network/ws_api.js";

import {
    setRoomId,
    setGameState,
} from "../store/gameSlice.js";

import { store } from "../store/store.js";


let connection = null;


export async function create_room_and_connect(
    roomConfig,
    playerName,
    onConnected
) {
    const data =
        await create_room(roomConfig);

    const roomId =
        data.room_id;

    store.dispatch(
        setRoomId(roomId)
    );

    connect(
        roomId,
        playerName,
        onConnected
    );

    return roomId;
}


export function connect_to_room(
    roomId,
    playerName,
    onConnected
) {
    return new Promise(
        (resolve, reject) => {
            try {
                connect(
                    roomId,
                    playerName,
                    () => {
                        if (onConnected) {
                            onConnected();
                        }

                        resolve(roomId);
                    }
                );
            }
            catch (error) {
                reject(error);
            }
        }
    );
}


function connect(
    roomId,
    playerName,
    onConnected
) {
    if (connection !== null) {
        connection.close();
    }


    connection =
        create_connection(
            roomId,
            playerName
        );


    connection.on_open(() => {
        console.log(
            "Game WebSocket connected"
        );

        if (onConnected) {
            onConnected();
        }
    });


    connection.on_message((data) => {
        /*
         * Backend sends the complete GameState:
         *
         * {
         *     player_id,
         *     service_info,
         *     player_fleet,
         *     entities: {
         *         ships,
         *         ordnance,
         *     },
         * }
         *
         * Store it without transformation.
         */
        store.dispatch(
            setGameState(data)
        );
    });


    connection.on_error((error) => {
        console.error(
            "Game WebSocket error:",
            error
        );
    });


    connection.on_close(() => {
        console.log(
            "Game WebSocket closed"
        );

        connection = null;
    });
}


export function send_command(command) {
    if (connection === null) {
        console.warn(
            "WebSocket is not connected"
        );

        return;
    }


    connection.send({
        command,
    });
}


export function disconnect() {
    if (connection !== null) {
        connection.close();
        connection = null;
    }
}

