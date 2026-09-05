import { useSelector } from "react-redux";


function RawGameDataViewer() {
    const gameState = useSelector(
        state => state.game.gameState
    );

    return (
        <pre
            style={{
                width: "100%",
                maxWidth: "900px",
                maxHeight: "500px",
                overflow: "auto",

                padding: "16px",

                background: "#11151c",
                color: "#d7dde7",

                border: "1px solid #2a303a",
                borderRadius: "8px",

                fontFamily: "monospace",
                fontSize: "13px",
                lineHeight: "1.5",

                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
            }}
        >
            {JSON.stringify(gameState, null, 2)}
        </pre>
    );
}


export default RawGameDataViewer;