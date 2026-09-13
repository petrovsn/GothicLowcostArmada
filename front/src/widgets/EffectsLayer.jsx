import { useEffect, useState } from "react";


const MacroProjectile = ({ effect }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const start = performance.now();
        let animationFrame;

        const animate = (now) => {
            const elapsed = now - start;

            const nextProgress = Math.min(
                elapsed / 180,
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
    }, []);

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
            cy={y}
            r="0.35"
            fill="#ffffff"
            opacity="0.9"
        />
    );
};


const Explosion = ({ effect }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const start = performance.now();
        let animationFrame;

        const animate = (now) => {
            const elapsed = now - start;

            const nextProgress = Math.min(
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

    const opacity = 1 - progress;

    const radius =
        effect.radius * (0.7 + progress * 0.3);

    return (
        <>
            <circle
                cx={effect.position.x}
                cy={effect.position.y}
                r={radius}
                fill="#ff6a00"
                opacity={0.8 * opacity}
            />

            <circle
                cx={effect.position.x}
                cy={effect.position.y}
                r={radius * 2}
                fill="none"
                stroke="#ff2a00"
                strokeWidth="0.5"
                opacity={0.6 * opacity}
            />
        </>
    );
};


const Laser = ({ effect }) => {
    return (
        <line
            x1={effect.from.x}
            y1={effect.from.y}
            x2={effect.to.x}
            y2={effect.to.y}
            stroke="#ff0000"
            strokeWidth="0.5"
            opacity="0.9"
        />
    );
};


const GenericEffect = ({ effect }) => {
    if (!effect.from || !effect.to) {
        return null;
    }

    return (
        <line
            x1={effect.from.x}
            y1={effect.from.y}
            x2={effect.to.x}
            y2={effect.to.y}
            strokeWidth="0.5"
            opacity="0.7"
        />
    );
};


export default function EffectsLayer({ effects }) {
    return (
        <g className="effects-layer">
            {effects.map((effect) => {
                switch (effect.type) {
                    case "macro_projectile":
                        return (
                            <MacroProjectile
                                key={effect.id}
                                effect={effect}
                            />
                        );

                    case "explosion":
                        return (
                            <Explosion
                                key={effect.id}
                                effect={effect}
                            />
                        );

                    case "laser":
                        return (
                            <Laser
                                key={effect.id}
                                effect={effect}
                            />
                        );

                    case "attack":
                    case "move":
                        return (
                            <GenericEffect
                                key={effect.id}
                                effect={effect}
                            />
                        );

                    default:
                        return null;
                }
            })}
        </g>
    );
}