import * as game_controller from "./game_controller.js";


export function move_ship(shipId, position) {
    game_controller.send_command({
        type: "move",
        ship_id: shipId,
        target: {
            x: position.x,
            y: position.y,
        },
    });
}


export function attack_ship(shipId, targetShipId) {
    game_controller.send_command({
        type: "attack",
        ship_id: shipId,
        target_id: targetShipId,
    });
}

