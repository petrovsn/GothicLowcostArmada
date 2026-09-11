const EXPLOSION_RADIUS = 0.5

function EffectsLayer({ effects }) {
    return (
        <>
            {effects.map((effect) => {
                if (effect.type === "explosion") {
                    return (
                        <g
                            key={effect.id}
                            transform={`translate(${effect.position.x}, ${-effect.position.y})`}
                        >
                            <circle
                                r={EXPLOSION_RADIUS}
                                fill="#ff6a00"
                                opacity="0.8"
                            />

                            <circle
                                r={EXPLOSION_RADIUS*2}
                                fill="none"
                                stroke="#ff2a00"
                                strokeWidth="0.5"
                                opacity="0.6"
                            />
                        </g>
                    );
                }

                if (effect.type === "laser") {
                    return (
                        <g key={effect.id}>
                            <line
                                x1={effect.from.x}
                                y1={-effect.from.y}
                                x2={effect.to.x}
                                y2={-effect.to.y}
                                stroke="#5fdcff"
                                strokeWidth="1.8"
                                opacity="0.18"
                            />

                            <line
                                x1={effect.from.x}
                                y1={-effect.from.y}
                                x2={effect.to.x}
                                y2={-effect.to.y}
                                stroke="#d9f9ff"
                                strokeWidth="0.35"
                                opacity="0.95"
                            />
                        </g>
                    );
                }

                const color =
                    effect.type === "attack"
                        ? "red"
                        : effect.type === "move"
                            ? "blue"
                            : "black";

                return (
                    <line
                        key={effect.id}
                        x1={effect.from.x}
                        y1={-effect.from.y}
                        x2={effect.to.x}
                        y2={-effect.to.y}
                        stroke={color}
                        strokeWidth="0.7"
                        opacity="0.5"
                    />
                );
            })}
        </>
    );
}


export default EffectsLayer;