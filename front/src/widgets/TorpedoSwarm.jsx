import {
    useMemo,
} from "react";


const TORPEDO_SPREAD = 0.45;
const TORPEDO_LENGTH = 1.2;
const TORPEDO_WIDTH = 0.28;


function hashString(value) {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash =
            (
                (
                    hash << 5
                ) -
                hash +
                value.charCodeAt(index)
            ) |
            0;
    }

    return Math.abs(hash);
}


function createTorpedoOffsets(
    uuid,
    count
) {
    const seed =
        hashString(uuid);

    const offsets = [];

    for (
        let index = 0;
        index < count;
        index += 1
    ) {
        const value =
            (
                seed +
                index * 7919
            ) % 10000 / 10000;

        const secondary =
            (
                seed +
                index * 104729
            ) % 10000 / 10000;

        const spread =
            (
                value * 2 -
                1
            ) * TORPEDO_SPREAD;

        const forward =
            (
                secondary * 2 -
                1
            ) * TORPEDO_SPREAD * 0.35;

        offsets.push({
            spread,
            forward,
        });
    }

    return offsets;
}


function Torpedo({
    x,
    y,
    rotation,
}) {
    return (
        <g
            transform={`
                translate(${x} ${-y})
                rotate(${-rotation})
            `}
            className="torpedo"
        >
            <polygon
                points={`
                    ${TORPEDO_LENGTH / 2},0
                    ${-TORPEDO_LENGTH / 2},${TORPEDO_WIDTH / 2}
                    ${-TORPEDO_LENGTH / 2},${-TORPEDO_WIDTH / 2}
                `}
            />

            <line
                x1={-TORPEDO_LENGTH / 2}
                y1={0}
                x2={-TORPEDO_LENGTH * 0.85}
                y2={0}
                className="torpedo-trail"
            />
        </g>
    );
}


function TorpedoSwarm({
    torpedo,
}) {
    const power =
        Math.max(
            0,
            Math.floor(
                Number(torpedo.power) || 0
            )
        );

    const offsets =
        useMemo(
            () =>
                createTorpedoOffsets(
                    torpedo.uuid,
                    power
                ),
            [
                torpedo.uuid,
                power,
            ]
        );

    const rotation =
        Number(
            torpedo.position?.rotation
        ) || 0;

    const radians =
        rotation *
        Math.PI /
        180;

    const directionX =
        Math.cos(radians);

    const directionY =
        Math.sin(radians);

    const perpendicularX =
        -directionY;

    const perpendicularY =
        directionX;

    const baseX =
        Number(
            torpedo.position?.x
        ) || 0;

    const baseY =
        Number(
            torpedo.position?.y
        ) || 0;


    return (
        <g
            className="torpedo-swarm"
        >
            {offsets.map(
                (
                    offset,
                    index
                ) => {
                    const x =
                        baseX +
                        perpendicularX *
                        offset.spread +
                        directionX *
                        offset.forward;

                    const y =
                        baseY +
                        perpendicularY *
                        offset.spread +
                        directionY *
                        offset.forward;

                    return (
                        <Torpedo
                            key={`${torpedo.uuid}-${index}`}
                            x={x}
                            y={y}
                            rotation={rotation}
                        />
                    );
                }
            )}
        </g>
    );
}


export default TorpedoSwarm;