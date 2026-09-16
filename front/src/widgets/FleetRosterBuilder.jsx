import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { request } from "../network/http_api.js";

import "../styles/FleetRosterBuilder.css";


const MOUNTING_POINTS = {
    PROW: "prow",
    PORT: "port",
    STARBOARD: "starboard",
    DORSAL: "dorsal",
    KEEL: "keel",
};


function parseWeapon(weapon) {
    const parts =
        weapon
            .trim()
            .split("/");

    if (parts.length !== 4) {
        return {
            raw: weapon,
            arc: "",
            type: "",
            range: "",
            power: "",
        };
    }

    const [
        arc,
        type,
        range,
        power,
    ] = parts;

    const weaponArcs = {
        front: "F",
        left: "L",
        right: "R",
        all_around: "O",
    };

    const weaponTypes = {
        M: "MACRO",
        L: "LASER",
        T: "TORPEDOS",
    };

    return {
        raw: weapon,
        arc: weaponArcs[arc] ?? arc,
        type: weaponTypes[type] ?? type,
        range,
        power,
    };
}


function WeaponsTable({
    weapons,
}) {
    if (!weapons || weapons.length === 0) {
        return (
            <div className="roster-ship-sector-empty">
                Нет орудий
            </div>
        );
    }

    return (
        <table className="roster-ship-weapons-table">
            <thead>
                <tr>
                    <th>Сектор</th>
                    <th>Тип</th>
                    <th>Дальн.</th>
                    <th>Мощн.</th>
                </tr>
            </thead>

            <tbody>
                {weapons.map(
                    (weapon, index) => {
                        const parsed =
                            parseWeapon(weapon);

                        return (
                            <tr
                                key={
                                    `${weapon}-${index}`
                                }
                            >
                                <td>
                                    {parsed.arc}
                                </td>

                                <td>
                                    {parsed.type}
                                </td>

                                <td>
                                    {parsed.range}
                                </td>

                                <td>
                                    {parsed.power}
                                </td>
                            </tr>
                        );
                    }
                )}
            </tbody>
        </table>
    );
}


function ShipDetails({
    template,
    onAdd,
    onRemove,
    canAdd,
    canRemove,
}) {
    if (!template) {
        return (
            <div className="fleet-roster-details-empty">
                Выберите корабль
            </div>
        );
    }

    const defence =
        template.defence ?? {};

    const engine =
        template.engine ?? {};

    const weapons =
        template.weapons ?? {};

    const armor =
        defence.armor ?? {};

    const prowWeapons =
        weapons[
            MOUNTING_POINTS.PROW
        ] ?? [];

    const portWeapons =
        weapons[
            MOUNTING_POINTS.PORT
        ] ?? [];

    const starboardWeapons =
        weapons[
            MOUNTING_POINTS.STARBOARD
        ] ?? [];

    const dorsalWeapons =
        weapons[
            MOUNTING_POINTS.DORSAL
        ] ?? [];

    const keelWeapons =
        weapons[
            MOUNTING_POINTS.KEEL
        ] ?? [];

    const allWeapons = [
        ...prowWeapons,
        ...portWeapons,
        ...starboardWeapons,
        ...dorsalWeapons,
        ...keelWeapons,
    ];

    return (
        <div className="fleet-roster-details">

            <div className="fleet-roster-details-header">

                <div>
                    <div className="fleet-roster-details-name">
                        {template.pattern}
                    </div>

                    <div className="fleet-roster-details-class">
                        {template.vessel_class}
                    </div>
                </div>

                <div className="fleet-roster-details-cost">
                    {template.cost} очков
                </div>

            </div>


            <div className="fleet-roster-details-content">

                <div className="roster-ship-weapons">

                    <div className="roster-section-title">
                        ОРУДИЯ
                    </div>

                    <WeaponsTable
                        weapons={allWeapons}
                    />

                </div>


                <div className="roster-ship-defence">

                    <div className="roster-section-title">
                        ЗАЩИТА
                    </div>

                    <div className="roster-stat-row">
                        <span>Броня:</span>

                        <strong>
                            {[
                                armor.front ?? 0,
                                armor.left ?? 0,
                                armor.right ?? 0,
                                armor.rear ?? 0,
                            ].join("/")}
                        </strong>
                    </div>

                    <div className="roster-stat-row">
                        <span>Корпус</span>

                        <strong>
                            {defence.hp ?? 0}
                        </strong>
                    </div>

                    <div className="roster-stat-row">
                        <span>Щит</span>

                        <strong>
                            {defence.shield ?? 0}
                        </strong>
                    </div>

                    <div className="roster-stat-row">
                        <span>Башни</span>

                        <strong>
                            {defence.turrets ?? 0}
                        </strong>
                    </div>

                </div>


                <div className="roster-ship-engine">

                    <div className="roster-section-title">
                        ДВИГАТЕЛЬ
                    </div>

                    <div className="roster-stat-row">
                        <span>Тяга</span>

                        <strong>
                            {engine.speed ?? 0}
                        </strong>
                    </div>

                    <div className="roster-stat-row">
                        <span>Поворот</span>

                        <strong>
                            {engine.turns ?? 0}
                        </strong>
                    </div>

                </div>

            </div>


            <div className="fleet-roster-actions">

                <button
                    type="button"
                    className="fleet-roster-add-button"
                    disabled={!canAdd}
                    onClick={onAdd}
                >
                    {canAdd
                        ? "Добавить в ростер"
                        : "Недостаточно очков"
                    }
                </button>

                <button
                    type="button"
                    className="fleet-roster-add-button"
                    disabled={!canRemove}
                    onClick={onRemove}
                >
                    Удалить из ростера
                </button>

            </div>

        </div>
    );
}


function FleetRosterBuilder({
    gameState,
    onRosterChange,
}) {
    const [templates, setTemplates] =
        useState({});

    const [selectedPattern, setSelectedPattern] =
        useState(null);

    const [roster, setRoster] =
        useState({});

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);


    const maxFleetPoints =
        Number(
            gameState?.service_info?.max_fleet_points ?? 0
        );


    useEffect(() => {
        let cancelled = false;

        async function loadTemplates() {
            try {
                setLoading(true);
                setError(null);

                const data =
                    await request(
                        "/game/templates"
                    );

                if (cancelled) {
                    return;
                }

                setTemplates(
                    data ?? {}
                );
            }
            catch (requestError) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to load ship templates:",
                    requestError
                );

                setError(
                    "Не удалось загрузить шаблоны кораблей"
                );
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadTemplates();

        return () => {
            cancelled = true;
        };
    }, []);


    useEffect(() => {
        if (!onRosterChange) {
            return;
        }

        const flattenedRoster =
            Object.entries(roster).flatMap(
                ([pattern, count]) =>
                    Array.from(
                        { length: count },
                        () => pattern
                    )
            );

        onRosterChange(
            flattenedRoster
        );
    }, [
        roster,
        onRosterChange,
    ]);


    const templateList =
        useMemo(
            () =>
                Object.values(
                    templates
                ),
            [templates]
        );


    const totalCost =
        useMemo(
            () =>
                Object.entries(
                    roster
                ).reduce(
                    (
                        total,
                        [pattern, count]
                    ) => {
                        const template =
                            templates[pattern];

                        if (!template) {
                            return total;
                        }

                        return (
                            total +
                            Number(
                                template.cost
                            ) *
                            count
                        );
                    },
                    0
                ),
            [
                roster,
                templates,
            ]
        );


    const remainingPoints =
        maxFleetPoints -
        totalCost;


    const selectedTemplate =
        selectedPattern
            ? templates[
                selectedPattern
            ]
            : null;


    const selectedCount =
        selectedPattern
            ? (
                roster[
                    selectedPattern
                ] ?? 0
            )
            : 0;


    const canAddSelected =
        selectedTemplate !== null &&
        Number(
            selectedTemplate.cost
        ) <= remainingPoints;


    const canRemoveSelected =
        selectedTemplate !== null &&
        selectedCount > 0;


    const handleAddShip = () => {
        if (!selectedTemplate) {
            return;
        }

        const cost =
            Number(
                selectedTemplate.cost
            );

        if (cost > remainingPoints) {
            return;
        }

        setRoster(
            previous => ({
                ...previous,
                [selectedTemplate.pattern]:
                    (
                        previous[
                            selectedTemplate.pattern
                        ] ?? 0
                    ) + 1,
            })
        );
    };


    const handleRemoveShip = () => {
        if (!selectedTemplate) {
            return;
        }

        setRoster(
            previous => {
                const currentCount =
                    previous[
                        selectedTemplate.pattern
                    ] ?? 0;

                if (currentCount <= 1) {
                    const next = {
                        ...previous,
                    };

                    delete next[
                        selectedTemplate.pattern
                    ];

                    return next;
                }

                return {
                    ...previous,
                    [selectedTemplate.pattern]:
                        currentCount - 1,
                };
            }
        );
    };


    if (loading) {
        return (
            <div className="fleet-roster-builder">
                <div className="fleet-roster-loading">
                    Загрузка шаблонов...
                </div>
            </div>
        );
    }


    if (error) {
        return (
            <div className="fleet-roster-builder">
                <div className="fleet-roster-error">
                    {error}
                </div>
            </div>
        );
    }


    return (
        <div className="fleet-roster-builder">

            <div className="fleet-roster-builder-header">

                <div className="fleet-roster-builder-title">
                    СБОРКА ФЛОТА
                </div>

                <div
                    className={
                        `fleet-roster-points ${
                            remainingPoints < 0
                                ? "negative"
                                : ""
                        }`
                    }
                >
                    Осталось:

                    <strong>
                        {remainingPoints}
                    </strong>

                    / {maxFleetPoints}
                </div>

            </div>


            <div className="fleet-roster-builder-content">

                <div className="fleet-roster-template-list">

                    <div className="fleet-roster-list-title">
                        КОРАБЛИ
                    </div>

                    {templateList.map(
                        template => {
                            const count =
                                roster[
                                    template.pattern
                                ] ?? 0;

                            return (
                                <button
                                    key={
                                        template.pattern
                                    }
                                    type="button"
                                    className={
                                        `fleet-roster-template-item ${
                                            selectedPattern ===
                                            template.pattern
                                                ? "selected"
                                                : ""
                                        }`
                                    }
                                    onClick={() =>
                                        setSelectedPattern(
                                            template.pattern
                                        )
                                    }
                                >

                                    <div className="fleet-roster-template-icon">

                                        {template.vessel_class ===
                                            "escort" &&
                                            "▲"
                                        }

                                        {template.vessel_class ===
                                            "cruiser" &&
                                            "◆"
                                        }

                                        {template.vessel_class ===
                                            "battleship" &&
                                            "■"
                                        }

                                    </div>

                                    <div className="fleet-roster-template-info">

                                        <div className="fleet-roster-template-name">
                                            {template.pattern}
                                        </div>

                                        <div className="fleet-roster-template-class">
                                            {template.vessel_class}
                                        </div>

                                    </div>

                                    <div className="fleet-roster-template-cost">
                                        [x{count}]{" "}
                                        {template.cost}
                                    </div>

                                </button>
                            );
                        }
                    )}

                </div>


                <div className="fleet-roster-details-area">

                    <ShipDetails
                        template={
                            selectedTemplate
                        }
                        canAdd={
                            canAddSelected
                        }
                        canRemove={
                            canRemoveSelected
                        }
                        onAdd={
                            handleAddShip
                        }
                        onRemove={
                            handleRemoveShip
                        }
                    />

                </div>

            </div>

        </div>
    );
}


export default FleetRosterBuilder;