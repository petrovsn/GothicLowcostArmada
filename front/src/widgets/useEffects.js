import { useCallback, useState } from "react";

const EFFECT_DURATION = 500;
const LASER_DURATION = 80;

const DEFAULT_EXPLOSION_RADIUS = 0.5;
const DEFAULT_EXPLOSION_SPREAD = 2;

const DEATH_EXPLOSION_RADIUS = 5;

const EXPLOSION_BASE_DURATION = 400;
const EXPLOSION_DURATION_PER_RADIUS = 200;
const EXPLOSION_DELAY = 200;

const MACRO_PROJECTILE_DURATION = 180;

const MACRO_SPREAD = 1.2;
const MACRO_START_SPREAD = 0.35;


const getRandomOffset = (radius) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * radius;

    return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
    };
};


const getExplosionPosition = (position, spreadRadius = 0) => {
    if (!spreadRadius) {
        return {
            x: position.x,
            y: position.y,
        };
    }

    const offset = getRandomOffset(spreadRadius);

    return {
        x: position.x + offset.x,
        y: position.y + offset.y,
    };
};


const getExplosionDuration = (radius) => {
    return (
        EXPLOSION_BASE_DURATION +
        radius * EXPLOSION_DURATION_PER_RADIUS
    );
};


export default function useEffects() {
    const [effects, setEffects] = useState([]);


    const addEffect = useCallback(
        (type, from, to, duration = EFFECT_DURATION) => {
            const id = crypto.randomUUID();

            setEffects((current) => [
                ...current,
                {
                    id,
                    type,
                    from,
                    to,
                },
            ]);

            setTimeout(() => {
                setEffects((current) =>
                    current.filter(
                        (effect) => effect.id !== id
                    )
                );
            }, duration);
        },
        [],
    );


    const addExplosion = useCallback(
        (
            position,
            radius = DEFAULT_EXPLOSION_RADIUS,
            delay = 0,
            spreadRadius = 0,
        ) => {
            const id = crypto.randomUUID();

            const explosionPosition =
                getExplosionPosition(
                    position,
                    spreadRadius,
                );

            const duration =
                getExplosionDuration(radius);

            setTimeout(() => {
                setEffects((current) => [
                    ...current,
                    {
                        id,
                        type: "explosion",
                        position: explosionPosition,
                        radius,
                        duration,
                    },
                ]);

                setTimeout(() => {
                    setEffects((current) =>
                        current.filter(
                            (effect) =>
                                effect.id !== id
                        )
                    );
                }, duration);
            }, delay);
        },
        [],
    );


    const addMacroProjectiles = useCallback(
        (event) => {
            const source = event.source;
            const target = event.target;

            const count = event.MACRO ?? 0;

            if (!source || !target || count <= 0) {
                return;
            }

            for (let index = 0; index < count; index++) {
                const startOffset =
                    getRandomOffset(
                        MACRO_START_SPREAD
                    );

                const endOffset =
                    getRandomOffset(
                        MACRO_SPREAD
                    );

                const from = {
                    x: source.x + startOffset.x,
                    y: source.y + startOffset.y,
                };

                const to = {
                    x: target.x + endOffset.x,
                    y: target.y + endOffset.y,
                };

                addEffect(
                    "macro_projectile",
                    from,
                    to,
                    MACRO_PROJECTILE_DURATION,
                );
            }
        },
        [addEffect],
    );


    const addFireEffect = useCallback(
        (event) => {
            if (
                event.event_type !==
                "fire_event_result"
            ) {
                return;
            }

            if (!event.source || !event.target) {
                return;
            }

            const macro = event.MACRO ?? 0;
            const lasers = event.LASERS ?? 0;
            const result = event.result ?? 0;

            if (macro > 0) {
                addMacroProjectiles(event);
            }

            for (let index = 0; index < lasers; index++) {
                addEffect(
                    "laser",
                    event.source,
                    event.target,
                    LASER_DURATION,
                );
            }

            for (
                let index = 0;
                index < result;
                index++
            ) {
                addExplosion(
                    event.target,
                    DEFAULT_EXPLOSION_RADIUS,
                    index * EXPLOSION_DELAY,
                    DEFAULT_EXPLOSION_SPREAD,
                );
            }
        },
        [
            addEffect,
            addMacroProjectiles,
            addExplosion,
        ],
    );


    const addDeathEffect = useCallback(
        (event) => {
            if (
                event.event_type !==
                "ship_death_event"
            ) {
                return;
            }

            if (!event.position) {
                return;
            }

            addExplosion(
                event.position,
                DEATH_EXPLOSION_RADIUS,
                0,
                0,
            );
        },
        [addExplosion],
    );


    return {
        effects,
        addEffect,
        addExplosion,
        addFireEffect,
        addDeathEffect,
    };
}