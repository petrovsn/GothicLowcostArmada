import { useCallback, useEffect, useState } from "react";


const EFFECT_DURATION = 500;


function useEffects() {
    const [effects, setEffects] = useState([]);

    const addEffect = useCallback((type, from, to) => {
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
                prev.filter((effect) => effect.id !== id)
            );
        }, EFFECT_DURATION);
    }, []);

    return {
        effects,
        addEffect,
    };
}


export default useEffects;