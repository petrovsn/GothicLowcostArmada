import { useEffect, useState } from "react";

const EXPLOSION_RADIUS = 0.5;

function MacroProjectile({ effect }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const startTime = performance.now();

        let animationFrame;

        const animate = (currentTime) => {
            const elapsed =
                currentTime - startTime;

            const nextProgress =
                Math.min(
                    elapsed / effect.duration,
                    1,
                );

            setProgress(nextProgress);

            if (nextProgress < 1) {
                animationFrame =
                    requestAnimationFrame(animate);
            }
        };

        animationFrame =
            requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [effect.duration]);

    const x =
        effect.from.x +
        (effect.to.x - effect.from.x) *
            progress;

    const y =
        effect.from.y +
        (effect.to.y - effect.from.y) *
            progress;

    return (
        <circle
            cx={x}
            cy={-y}
            r="0.22"
            fill="#ff3030"
            opacity="0.95"
        />
    );
}

function EffectsLayer({ effects }) {
    return (
        <>
            {effects.map((effect) => {
                if (
                    effect.type ===
                    "macro_projectile"
                ) {
                    return (
                        <MacroProjectile
                            key={effect.id}
                            effect={effect}
                        />
                    );
                }

                if (
                    effect.type === "explosion"
                ) {
                    return (
                        <g
                            key={effect.id}
                            transform={
                                `translate(` +
                                `${effect.position.x}, ` +
                                `${-effect.position.y})`
                            }
                        >
                            <circle
                                r={
                                    EXPLOSION_RADIUS
                                }
                                fill="#ff6a00"
                                opacity="0.8"
                            />

                            <circle
                                r={
                                    EXPLOSION_RADIUS * 2
                                }
                                fill="none"
                                stroke="#ff2a00"
                                strokeWidth="0.5"
                                opacity="0.6"
                            />
                        </g>
                    );
                }

                if (
                    effect.type === "laser"
                ) {
                    return (
                        <g key={effect.id}>
                            <line
                                x1={effect.from.x}
                                y1={
                                    -effect.from.y
                                }
                                x2={effect.to.x}
                                y2={
                                    -effect.to.y
                                }
                                stroke="#5fdcff"
                                strokeWidth="1.8"
                                opacity="0.18"
                            />

                            <line
                                x1={effect.from.x}
                                y1={
                                    -effect.from.y
                                }
                                x2={effect.to.x}
                                y2={
                                    -effect.to.y
                                }
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

                /*
                 * Старые эффекты:
                 * attack / move / прочие line-effects.
                 */
                if (
                    effect.from &&
                    effect.to
                ) {
                    return (
                        <line
                            key={effect.id}
                            x1={effect.from.x}
                            y1={
                                -effect.from.y
                            }
                            x2={effect.to.x}
                            y2={
                                -effect.to.y
                            }
                            stroke={color}
                            strokeWidth="0.7"
                            opacity="0.5"
                        />
                    );
                }

                return null;
            })}
        </>
    );
}

export default EffectsLayer;