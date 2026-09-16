import * as game_controller from "./game_controller.js";


export function pause() {
    game_controller.send_command({
        type: "game_room",
        action: "pause",
        params: {
        },
    });
}


export function setup_roster(roster) {
    console.log("setup_roster", roster)
    game_controller.send_command({
        type: "game_room",
        action: "setup_roster",
        params: roster,
    });
}


export function resume() {
    console.log("resume")
    game_controller.send_command({
        type: "game_room",
        action: "resume",
        params: {
        },
    });
}