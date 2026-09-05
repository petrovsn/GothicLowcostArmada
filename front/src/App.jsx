import { useEffect, useState } from "react";
import * as game_controller from "./controllers/game_controller.js";
import GameViewer from "./widgets/GameViewer.jsx";
import RawGameDataViewer from "./widgets/RawGameDataViewer.jsx";
import PlayersTable from "./widgets/PlayersTable.jsx";
import CreateRoomWidget from "./widgets/CreateRoomWidget.jsx";
import RoomStatusWidget from "./widgets/RoomStatusWidget.jsx";
import JoinRoomWidget from "./widgets/JoinRoomWidget.jsx";
import PlayerStatusWidget from "./widgets/PlayerStatusWidget.jsx";
import FleetPanel from "./widgets/FleetPanel.jsx";
import './styles/App.css'

function App() {
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    console.log("App.useEffect", isConnected)
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

      const command = commands[event.code];

      if (!command) {
        return;
      }

      event.preventDefault();

      game_controller.send_command(command);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      game_controller.disconnect();
    };
  }, [isConnected]);



    return (
        <div className="App">

            <header className="app-header">

                <h1>SnakesKingdom</h1>

                <div className="room-actions">

                    <CreateRoomWidget
                        onConnectionChange={setIsConnected}
                    />

                    <JoinRoomWidget
                        onConnectionChange={setIsConnected}
                    />

                </div>

            </header>


            <main className="game-layout">

                {/* СЛЕВА */}
                <aside className="game-sidebar">

                    <RoomStatusWidget />
                   

                    <PlayerStatusWidget />

                </aside>


                {/* ЦЕНТР */}
                <section className="game-area">

                    <GameViewer />
                     <FleetPanel/>
                    <RawGameDataViewer/>

                </section>


                {/* СПРАВА */}
                <section className="players-area">

                    <PlayersTable />

                </section>

            </main>

        </div>
    );
}


export default App;