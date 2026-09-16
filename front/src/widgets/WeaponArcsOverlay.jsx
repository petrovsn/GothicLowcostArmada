import "../styles/WeaponArcsOverlay.css";
const ARC_CONFIG = {
    front: {
        start: -45,
        end: 45,
    },

    right: {
        start: 45,
        end: 135,
    },

    rear: {
        start: 135,
        end: 225,
    },

    left: {
        start: 225,
        end: 315,
    },

    all_around: {
        start: 0,
        end: 360,
    },
};


function polarPoint(
    radius,
    angle
) {
    const radians =
        angle * Math.PI / 180;

    return {
        x:
            Math.sin(radians) *
            radius,

        y:
            -Math.cos(radians) *
            radius,
    };
}


function describeArc(
    radius,
    startAngle,
    endAngle
) {
    if (
        Math.abs(
            endAngle - startAngle
        ) >= 360
    ) {
        return [
            `M 0 ${-radius}`,
            `A ${radius} ${radius} 0 1 1 0 ${radius}`,
            `A ${radius} ${radius} 0 1 1 0 ${-radius}`,
        ].join(" ");
    }

    const start =
        polarPoint(
            radius,
            startAngle
        );

    const end =
        polarPoint(
            radius,
            endAngle
        );

    const largeArc =
        Math.abs(
            endAngle - startAngle
        ) > 180
            ? 1
            : 0;

    return [
        `M ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    ].join(" ");
}


function WeaponArc({
    weapon,
    ship,
}) {
    const fireArc =
        ARC_CONFIG[
            weapon.fire_arc
        ];

    if (!fireArc) {
        return null;
    }

    const radius =
        Number(weapon.range);

    if (
        !Number.isFinite(radius) ||
        radius <= 0
    ) {
        return null;
    }

    const isFullCircle =
        weapon.fire_arc ===
        "all_around";

    if (isFullCircle) {
        return (
            <circle
                cx={ship.position.x}
                cy={-ship.position.y}
                r={radius}
                className="weapon-arc weapon-arc-all-around"
            />
        );
    }

    const {
        start,
        end,
    } = fireArc;

    const path =
        describeArc(
            radius,
            start,
            end
        );

    const sectorStart =
        polarPoint(
            radius,
            start
        );

    const sectorEnd =
        polarPoint(
            radius,
            end
        );

    const sectorPath = [
        `M 0 0`,
        `L ${sectorStart.x} ${sectorStart.y}`,
        `A ${radius} ${radius} 0 0 1 ${sectorEnd.x} ${sectorEnd.y}`,
        `Z`,
    ].join(" ");

    return (
        <g
            transform={`
                translate(
                    ${ship.position.x}
                    ${-ship.position.y}
                )
                rotate(
                    ${ship.position.rotation ?? 0}
                )
            `}
            className="weapon-arc-group"
        >
            <path
                d={sectorPath}
                className="weapon-arc-sector"
            />

            <path
                d={path}
                className="weapon-arc-line"
            />

            <line
                x1="0"
                y1="0"
                x2={sectorStart.x}
                y2={sectorStart.y}
                className="weapon-arc-boundary"
            />

            <line
                x1="0"
                y1="0"
                x2={sectorEnd.x}
                y2={sectorEnd.y}
                className="weapon-arc-boundary"
            />
        </g>
    );
}


function WeaponArcsOverlay({
    ships = [],
    playerFleet = {},
    playerId,
    shipFleetMap = {},
}) {
    return (
        <g className="weapon-arcs-overlay">
            {ships.map(ship => {
                const ownerId =
                    shipFleetMap[
                        ship.uuid
                    ];

                if (
                    ownerId !== playerId
                ) {
                    return null;
                }

                const fleetShip =
                    playerFleet[
                        ship.uuid
                    ];

                const mountingPoints =
                    fleetShip?.weapons
                        ?.mounting_points;

                if (!mountingPoints) {
                    return null;
                }

                const weapons = [];

                for (
                    const pointWeapons
                    of Object.values(
                        mountingPoints
                    )
                ) {
                    if (!Array.isArray(pointWeapons)) {
                        continue;
                    }

                    weapons.push(
                        ...pointWeapons
                    );
                }

                return (
                    <g
                        key={
                            `weapon-arcs-${ship.uuid}`
                        }
                    >
                        {weapons.map(
                            weapon => (
                                <WeaponArc
                                    key={
                                        weapon.uuid
                                    }
                                    weapon={
                                        weapon
                                    }
                                    ship={
                                        ship
                                    }
                                />
                            )
                        )}
                    </g>
                );
            })}
        </g>
    );
}


export default WeaponArcsOverlay;
