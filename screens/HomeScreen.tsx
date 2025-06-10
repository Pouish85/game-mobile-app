import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

interface HomeScreenProps {
    onStartMemoryGame: () => void;
    onStartSnakeGame: () => void;
    onStartSudokuGame: () => void;
    onStartMastermindGame: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartMemoryGame, onStartSnakeGame, onStartSudokuGame, onStartMastermindGame }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome in Memory Game!</Text>
            <Text style={styles.text}>Keep calm and Scramble your brain!</Text>
            <Image
                source={require('../assets/logo.png')} // Chemin mis à jour
                style={styles.logo}
            />
            <View style={styles.gameContainer}>
                <TouchableOpacity
                style={styles.startButton}
                onPress={onStartMemoryGame}
                >
                    <Text style={styles.startButtonText}>Memory Game</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={onStartSnakeGame}
                >
                    <Text style={styles.startButtonText}>Snake(soon)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={onStartSudokuGame}
                >
                    <Text style={styles.startButtonText}>Sudoku</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={onStartMastermindGame}
                >
                    <Text style={styles.startButtonText}>Mastermind(soon)</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8f5e9',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    gameContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 5,
    },
    text: {
        color: '#111',
        fontSize: 20,
        marginBottom: 10
    },
    logo: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        marginBottom: 50,
        borderRadius: 50
    },
    startButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: "45%",
        height: 60
    },
    startButtonText: {
        color: '#fff', // Correction: '#11' -> '#fff' pour un texte blanc sur fond vert
        fontSize: 15,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
