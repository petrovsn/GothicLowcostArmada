import { useState } from "react";
import * as game_controller from "../controllers/game_controller";
import "../styles/CreateRoomWidget.css";


function CreateRoomWidget({ onCreated, onConnectionChange   }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        player_name: "",
        size_x: 10,
        size_y: 10,
        speed: 4,
        n_bots: 0,
        respawn: true,
    });


    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm(prev => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "number"
                        ? Number(value)
                        : value,
        }));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError(null);

        try {
            const {
                player_name,
                ...roomConfig
            } = form;

            const result =
                await game_controller.create_room_and_connect(
                    roomConfig,
                    player_name,
                    () => {
                        console.log("CreateRoomWidget.create_room_and_connect")
                        if (onConnectionChange ){
                            console.log("CreateRoomWidget.if onConnected")
                            onConnectionChange (true)
                        }
                    }
                );

            setIsOpen(false);

            if (onCreated) {
                onCreated(result);
            }
        }
        catch (error) {
            console.error(error);

            setError(
                error.detail?.detail ??
                error.message ??
                "Failed to create room"
            );
        }
        finally {
            setLoading(false);
        }
    };


    const handleOpen = () => {
        setError(null);
        setIsOpen(true);
        onConnectionChange (false)
    };


    const handleClose = () => {
        if (!loading) {
            setIsOpen(false);
            setError(null);
        }
    };


    if (!isOpen) {
        return (
            <button
                className="create-room-button"
                onClick={handleOpen}
            >
                Create room
            </button>
        );
    }


    return (
        <div
            className="create-room-overlay"
            onMouseDown={handleClose}
        >
            <div
                className="create-room-widget"
                onMouseDown={event => event.stopPropagation()}
            >
                <form
                    className="create-room-form"
                    onSubmit={handleSubmit}
                    autoComplete="off"
                >
                    <h2>Create room</h2>


                    <label>
                        Nickname

                        <input
                            type="text"
                            name="player_name"
                            value={form.player_name}
                            onChange={handleChange}
                            maxLength={32}
                            required
                            autoFocus
                            placeholder="Your nickname"
                        />
                    </label>


                    <div className="form-row">
                        <label>
                            Width

                            <input
                                type="number"
                                name="size_x"
                                min="1"
                                value={form.size_x}
                                onChange={handleChange}
                            />
                        </label>


                        <label>
                            Height

                            <input
                                type="number"
                                name="size_y"
                                min="1"
                                value={form.size_y}
                                onChange={handleChange}
                            />
                        </label>
                    </div>


                    <label>
                        Speed

                        <input
                            type="number"
                            name="speed"
                            min="1"
                            value={form.speed}
                            onChange={handleChange}
                        />
                    </label>


                    <label>
                        Bots

                        <input
                            type="number"
                            name="n_bots"
                            min="0"
                            value={form.n_bots}
                            onChange={handleChange}
                        />
                    </label>


                    <label className="checkbox-row">
                        <input
                            type="checkbox"
                            name="respawn"
                            checked={form.respawn}
                            onChange={handleChange}
                        />

                        Respawn
                    </label>


                    {error && (
                        <div className="create-room-error">
                            {error}
                        </div>
                    )}


                    <div className="create-room-actions">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Create room"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


export default CreateRoomWidget;