import { useCallback, useState } from "react";

const EFFECT_DURATION = 500;
const LASER_DURATION = 80;

const EXPLOSION_DURATION = 500;
const EXPLOSION_DELAY = 200;
const EXPLOSION_RADIUS = 2;

const MACRO_PROJECTILE_DURATION = 180;

const MACRO_SPREAD = 1.2;
const MACRO_START_SPREAD = 0.35;

function getRandomOffset(radius) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * radius;

    return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
    };
}

function getExplosionPosition(position) {
    const offset = getRandomOffset(EXPLOSION_RADIUS);

    return {
        x: position.x + offset.x,
        y: position.y + offset.y,
    };
}

function getMacroProjectilePosition(source, target) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;

    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
        return {
            from: { ...source },
            to: { ...target },
        };
    }

    const perpendicular = {
        x: -dy / length,
        y: dx / length,
    };

    const spread = getRandomOffset(MACRO_SPREAD);
    const startSpread = getRandomOffset(MACRO_START_SPREAD);

    const offset = {
        x:
            perpendicular.x * spread.x -
            dy / length * spread.y,

        y:
            perpendicular.y * spread.x +
            dx / length * spread.y,
    };

    return {
        from: {
            x: source.x + startSpread.x,
            y: source.y + startSpread.y,
        },

        to: {
            x: target.x + offset.x,
            y: target.y + offset.y,
        },
    };
}

function useEffects() {
    const [effects, setEffects] = useState([]);

    /*
     * Старый интерфейс addEffect сохраняем.
     */
    const addEffect = useCallback((
        type,
        from,
        to,
        duration = EFFECT_DURATION,
    ) => {
        const id = crypto.randomUUID();

        setEffects((prev) => [
            ...prev,
            {
                id,
                type,
                from,
                to,
            },
        ]);

        setTimeout(() => {
            setEffects((prev) =>
                prev.filter(
                    effect => effect.id !== id
                )
            );
        }, duration);
    }, []);

    const addMacroProjectiles = useCallback((
        event,
    ) => {
        const count = event.damage?.MACRO ?? 0;

        if (
            count <= 0 ||
            !event.source ||
            !event.target
        ) {
            return;
        }

        const projectiles = [];

        for (let index = 0; index < count; index += 1) {
            const id = crypto.randomUUID();

            const {
                from,
                to,
            } = getMacroProjectilePosition(
                event.source,
                event.target,
            );

            const duration =
                MACRO_PROJECTILE_DURATION *
                (0.9 + Math.random() * 0.2);

            projectiles.push({
                id,
                type: "macro_projectile",
                from,
                to,
                duration,
            });
        }

        /*
         * Весь залп появляется сразу.
         */
        setEffects((prev) => [
            ...prev,
            ...projectiles,
        ]);

        for (const projectile of projectiles) {
            setTimeout(() => {
                setEffects((prev) =>
                    prev.filter(
                        effect =>
                            effect.id !== projectile.id
                    )
                );
            }, projectile.duration);
        }
    }, []);

    const addFireEffect = useCallback((
        event,
    ) => {
        if (
            event.event_type !== "fire_event_result"
        ) {
            return;
        }

        /*
         * MACRO
         *
         * Показываем компактный залп
         * из красных точек.
         */
        if (
            (event.damage?.MACRO ?? 0) > 0
        ) {
            addMacroProjectiles(event);
        }

        /*
         * LASERS
         *
         * Лазер должен существовать независимо
         * от MACRO. Поэтому если в событии есть
         * лазерный урон — рисуем луч.
         */
        if (
            (event.damage?.LASERS ?? 0) > 0 &&
            event.source &&
            event.target
        ) {
            addEffect(
                "laser",
                event.source,
                event.target,
                LASER_DURATION,
            );
        }

        /*
         * ВЗРЫВЫ
         *
         * result — количество попаданий.
         */
        if (
            !event.target ||
            !event.result ||
            event.result <= 0
        ) {
            return;
        }

        for (
            let index = 0;
            index < event.result;
            index += 1
        ) {
            const id = crypto.randomUUID();

            const position =
                getExplosionPosition(event.target);

            setTimeout(() => {
                setEffects((prev) => [
                    ...prev,
                    {
                        id,
                        type: "explosion",
                        position,
                    },
                ]);
            }, index * EXPLOSION_DELAY);

            setTimeout(() => {
                setEffects((prev) =>
                    prev.filter(
                        effect =>
                            effect.id !== id
                    )
                );
            }, index * EXPLOSION_DELAY + EXPLOSION_DURATION);
        }
    }, [
        addEffect,
        addMacroProjectiles,
    ]);

    return {
        effects,
        addEffect,
        addFireEffect,
    };
}

export default useEffects;