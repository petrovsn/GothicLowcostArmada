import * as game_controller from "./game_controller.js";


export function pause() {
    game_controller.send_command({
        type: "game_room",
        action: "pause",
        params: {
        },
    });
}


export function resume() {
    game_controller.send_command({
        type: "game_room",
        action: "resume",
        params: {
        },
    });
}
