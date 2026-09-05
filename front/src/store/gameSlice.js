import { createSlice } from "@reduxjs/toolkit";

const gameSlice = createSlice({
    name: "game",

    initialState: {
        roomId: null,
        connected: false,
        gameState: null,
        selectedShipId: null,
    },

    reducers: {
        setRoomId(state, action) {
            state.roomId = action.payload;
        },

        setConnected(state, action) {
            state.connected = action.payload;
        },

        setGameState(state, action) {
            state.gameState = action;
        },

        setSelectedShip(state, action) {
            state.selectedShipId = action.payload;
        },
    },
});

export const {
    setRoomId,
    setConnected,
    setGameState,
    setSelectedShip,
} = gameSlice.actions;

export default gameSlice.reducer;
