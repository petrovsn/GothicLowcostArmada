const TIER_CONFIG = {
    escort: {
        size: 3,
        topWidth: 0,
    },

    cruiser: {
        size: 7,
        topWidth: 0.20,
    },

    battleship: {
        size: 12,
        topWidth: 0.36,
    },
};


function ShipIcon({
    tier,
    x = 0,
    y = 0,
    rotation = 0,
    scale = 1,
    color,
    className = "ship",
}) {
    const config =
        TIER_CONFIG[tier] ??
        TIER_CONFIG.cruiser;

    return (
        <g
            transform={`
                translate(${x} ${y})
                rotate(${rotation})
                scale(${config.size * scale})
            `}
            className={className}
            style={{
                fill: color,
            }}
        >
            <rect
                x="-0.15"
                y="0.20"
                width="0.30"
                height="0.30"
            />

            <rect
                x="-0.10"
                y="-0.05"
                width="0.20"
                height="0.25"
            />

            <polygon
                points={`
                    0,-0.50
                    ${config.topWidth / 2},-0.05
                    ${-config.topWidth / 2},-0.05
                `}
            />
        </g>
    );
}


export {
    TIER_CONFIG,
};


export default ShipIcon;
