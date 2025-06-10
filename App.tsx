import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import MemoryGameScreen from "./screens/memoryGame/GameScreen";
import SudokuGameScreen from "./screens/sudokuGame/GameScreen";

export default function App() {
    const [isMemoryGameStarted, setIsMemoryGameStarted] = useState<boolean>(false);
    const [isSnakeGameStarted, setIsSnakeGameStarted] = useState<boolean>(false);
    const [isSudokuGameStarted, setIsSudokuGameStarted] = useState<boolean>(false);
    const [isMastermindGameStarted, setIsMastermindGameStarted] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>("")

    const appStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#e8f5e9',
        },
    });

    if (isMemoryGameStarted) {
        return (
            <View style={appStyles.container}>
                <MemoryGameScreen setIsMemoryGameStarted={setIsMemoryGameStarted} />
                <StatusBar style="auto" />
            </View>
        );
    }

    // if (isSnakeGameStarted) {
    //     return (
    //         <View style={appStyles.container}>
    //             <Text onPress={() => setSelected("snake")}>{selected === "snake" ? "Soon" : "Snake Game Screen"}</Text>
    //             <StatusBar style="auto" />
    //         </View>
    //     );
    // }

    if (isSudokuGameStarted) {
        return (
            <View style={appStyles.container}>
                <SudokuGameScreen setIsSudokuGameStarted={setIsSudokuGameStarted} />
                <StatusBar style="auto" />
            </View>
        );
    }

    // if (isMastermindGameStarted) {
    //     return (
    //         <View style={appStyles.container}>
    //             <Text onPress={() => setSelected("mastermind")}>{selected === "mastermind" ? "Soon" : "Mastermind Game Screen"}</Text>
    //             <StatusBar style="auto" />
    //         </View>
    //     );
    // }

    return (
        <View style={appStyles.container}>
            <HomeScreen
                onStartMemoryGame={() => setIsMemoryGameStarted(true)}
                onStartSnakeGame={() => setIsSnakeGameStarted(true)}
                onStartSudokuGame={() => setIsSudokuGameStarted(true)}
                onStartMastermindGame={() => setIsMastermindGameStarted(true)}
            />
            <StatusBar style="auto" />
        </View>
    );
}
