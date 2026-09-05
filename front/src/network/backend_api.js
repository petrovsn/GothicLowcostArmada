
import {request} from './http_api'

export async function create_room(roomConfig) {
    console.log("ROOM CONFIG:", roomConfig);
    return request("/game/rooms", {
        method: "POST",
        body: JSON.stringify(roomConfig),
    });
}