import * as game_controller from "./game_controller.js";


export function move_ship(
    shipId,
    position
) {
    game_controller.send_command({
        type: "ship",
        action: "move_to",
        params: {
            ship_id: shipId,
            target: {
                x: position.x,
                y: position.y,
            },
        },
    });
}


export function attack_ship(
    shipId,
    targetShipId
) {
    game_controller.send_command({
        type: "ship",
        action: "fire_to",
        params: {
            ship_id: shipId,
            target: targetShipId,
        },
    });
}


export function set_full_speed(
    shipId
) {
    // TODO
}


export function set_half_speed(
    shipId
) {
    // TODO
}


export function set_automatic_speed(
    shipId
) {
    // TODO
}


export function clear_ship_target(
    shipId
) {
    // TODO
}

