"use client";
import React, { createContext, useContext, useState } from 'react';

const GameStateContext = createContext();

export function GameStateProvider({ children }) {
    const [gameState, setGameState] = useState({});

    return (
        <GameStateContext.Provider value={{ gameState, setGameState }}>
            {children}
        </GameStateContext.Provider>
    );
}

export function useGameState() {
    return useContext(GameStateContext);
}
