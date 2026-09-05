import { createSlice } from "@reduxjs/toolkit";

const gameSlice = createSlice({
    name: "game",

    initialState: {
        roomId: null,
        connected: false,
        gameState: null,
    },

    reducers: {
        setRoomId(state, action) {
            state.roomId = action.payload;
        },

        setConnected(state, action) {
            state.connected = action.payload;
        },

        setGameState(state, action){
            state.gameState = action
        }
    },
});

export const {
    setRoomId,
    setConnected,
    setGameState
} = gameSlice.actions;

export default gameSlice.reducer;