function EffectsLayer({ effects }) {
    return (
        <>
            {effects.map((effect) => {
                const { id, from, to, color } = effect;

                return (
                    <line
                        key={id}
                        x1={from.x}
                        y1={-from.y}
                        x2={to.x}
                        y2={-to.y}
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