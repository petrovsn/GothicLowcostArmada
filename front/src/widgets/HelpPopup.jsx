import {
    useState,
} from "react";

import "../styles/HelpPopup.css";


function HelpPopup() {
    const [
        isOpen,
        setIsOpen,
    ] = useState(false);


    const handleBackdropClick = (
        event
    ) => {
        if (
            event.target ===
            event.currentTarget
        ) {
            setIsOpen(false);
        }
    };


    return (
        <>
            <button
                type="button"
                className="help-button"
                onClick={() => setIsOpen(true)}
            >
                ?
            </button>


            {isOpen && (
                <div
                    className="help-popup-backdrop"
                    onMouseDown={
                        handleBackdropClick
                    }
                >
                    <div
                        className="help-popup"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Game instructions"
                    >
                        <div className="help-popup-header">
                            <h2>
                                Game instructions
                            </h2>

                            <button
                                type="button"
                                className="help-popup-close"
                                onClick={() =>
                                    setIsOpen(false)
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>


                        <div className="help-popup-content">
                            <h3>
                                Controls
                            </h3>

                            <p>
                                <strong>
                                    Left click(on your ship)
                                </strong>
                                {" — "}
                                select your ship
                            </p>

                            <p>
                                <strong>
                                    Left click(on empty space)
                                </strong>
                                {" — "}
                                select designation for move
                            </p>

                            <p>
                                <strong>
                                    Left click(on enemy ship)
                                </strong>
                                {" — "}
                                select target to attack
                            </p>

                            <p>
                                <strong>
                                    Double click
                                </strong>
                                {" — "}
                                launch torpedoes toward
                                the selected position.
                            </p>

                            <p>
                                <strong>
                                    Drag
                                </strong>
                                {" — "}
                                move the camera.
                            </p>

                            <p>
                                <strong>
                                    Mouse wheel
                                </strong>
                                {" — "}
                                zoom in or out.
                            </p>


                            <h3>
                                Fleet panel
                            </h3>

                            <p>
                                Shows hp, armor, shilds,
                                max speed and loaded torpedos.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


export default HelpPopup;
