import {
    useEffect,
    useState,
} from "react";

import * as game_controller from "./controllers/game_controller.js";

import GameViewer from "./widgets/GameViewer.jsx";
import RawGameDataViewer from "./widgets/RawGameDataViewer.jsx";
import PlayersTable from "./widgets/PlayersTable.jsx";
import CreateRoomWidget from "./widgets/CreateRoomWidget.jsx";
import RoomStatusWidget from "./widgets/RoomStatusWidget.jsx";
import JoinRoomWidget from "./widgets/JoinRoomWidget.jsx";
import PlayerStatusWidget from "./widgets/PlayerStatusWidget.jsx";
import FleetPanel from "./widgets/FleetPanel.jsx";

import "./styles/App.css";


function App() {
    const [isConnected, setIsConnected] =
        useState(false);

    const [camera, setCamera] = useState({
        x: 0,
        y: 0,
        zoom: 10,
    });


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
                    SnakesKingdom
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

                <aside className="game-sidebar">

                    <RoomStatusWidget />

                    <PlayerStatusWidget />

                </aside>


                <section className="game-area">

                    <GameViewer
                        camera={camera}
                        setCamera={setCamera}
                    />

                    <FleetPanel
                        onCenterShip={
                            (position) => {
                                setCamera(
                                    previous => ({
                                        ...previous,

                                        x: position.x,
                                        y: position.y,
                                    })
                                );
                            }
                        }
                    />

                    <RawGameDataViewer />

                </section>


                <section className="players-area">

                    <PlayersTable />

                </section>

            </main>

        </div>
    );
}


export default App;
