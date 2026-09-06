function EffectsLayer({ effects }) {
    return (
        <>
            {effects.map((effect) => {
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