import {
    useEffect,
    useState,
} from "react";

import { useSelector } from "react-redux";

import * as game_controller from "./controllers/game_controller.js";

import GameViewer from "./widgets/GameViewer.jsx";
import FleetRosterBuilder from "./widgets/FleetRosterBuilder.jsx";
import RawGameDataViewer from "./widgets/RawGameDataViewer.jsx";
import PlayersTable from "./widgets/PlayersTable.jsx";
import CreateRoomWidget from "./widgets/CreateRoomWidget.jsx";
import RoomStatusWidget from "./widgets/RoomStatusWidget.jsx";
import JoinRoomWidget from "./widgets/JoinRoomWidget.jsx";
import PlayerStatusWidget from "./widgets/PlayerStatusWidget.jsx";
import FleetPanel from "./widgets/FleetPanel.jsx";
import ShipControlPanel from "./widgets/ShipControlPanel.jsx";

import "./styles/App.css";


function App() {
    const [isConnected, setIsConnected] =
        useState(false);

    const [camera, setCamera] = useState({
        x: 0,
        y: 0,
        zoom: 8,
    });

    const [roster, setRoster] =
        useState([]);


    const gameState = useSelector(
        state => state.game.gameState?.payload
    );

    const currentPhase =
        gameState?.service_info?.current_phase;


    useEffect(() => {
        console.log(
            "App.useEffect",
            isConnected
        );

        if (!isConnected) {
            return;
        }

        const handleKeyDown = (event) => {
            const commands = {
                ArrowUp: "up",
                ArrowDown: "down",
                ArrowLeft: "left",
                ArrowRight: "right",

                KeyW: "up",
                KeyA: "left",
                KeyS: "down",
                KeyD: "right",
            };

            const command =
                commands[event.code];

            if (!command) {
                return;
            }

            event.preventDefault();

            game_controller.send_command(
                command
            );
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

            game_controller.disconnect();
        };
    }, [isConnected]);


    return (
        <div className="App">

            <header className="app-header">

                <h1>
                    Gothic Lowcost Armada
                </h1>

                <div className="room-actions">

                    <CreateRoomWidget
                        onConnectionChange={
                            setIsConnected
                        }
                    />

                    <JoinRoomWidget
                        onConnectionChange={
                            setIsConnected
                        }
                    />

                </div>

            </header>


            <main className="game-layout">

                <section className="game-sidebar">

                    <RoomStatusWidget />

                    <PlayerStatusWidget
                        roster={roster}
                    />

                </section>


                <section className="game-area">

                    {currentPhase === "preparation" ? (
                        <FleetRosterBuilder
                            gameState={gameState}
                            onRosterChange={
                                setRoster
                            }
                        />
                    ) : (
                        <GameViewer
                            camera={camera}
                            setCamera={setCamera}
                        />
                    )}


                    <FleetPanel
                        onCenterShip={
                            (shipId) => {
                                const ship =
                                    gameState?.entities?.ships?.find(
                                        currentShip =>
                                            currentShip.uuid === shipId
                                    );

                                if (!ship?.position) {
                                    return;
                                }

                                setCamera(previous => ({
                                    ...previous,
                                    x: ship.position.x,
                                    y: ship.position.y,
                                }));
                            }
                        }
                    />

                    <RawGameDataViewer />

                </section>


                <section className="players-area">

                    <ShipControlPanel />

                </section>

            </main>

        </div>
    );
}


export default App;