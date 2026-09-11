import { useCallback, useState } from "react";


const EFFECT_DURATION = 500;
const LASER_DURATION = 80;
const EXPLOSION_DURATION = 300;
const EXPLOSION_DELAY = 200;
const EXPLOSION_RADIUS = 2;


function getExplosionPosition(position) {
    const angle = Math.random() * Math.PI * 2;
    const radius =
        Math.sqrt(Math.random()) * EXPLOSION_RADIUS;

    return {
        x: position.x + Math.cos(angle) * radius,
        y: position.y + Math.sin(angle) * radius,
    };
}


function useEffects() {
    const [effects, setEffects] = useState([]);


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


    const addFireEffect = useCallback((
        event,
    ) => {
        addEffect(
            "laser",
            event.source,
            event.target,
            LASER_DURATION,
        );

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
                        effect => effect.id !== id
                    )
                );
            }, index * EXPLOSION_DELAY + EXPLOSION_DURATION);
        }
    }, [addEffect]);


    return {
        effects,
        addEffect,
        addFireEffect,
    };
}


export default useEffects;
