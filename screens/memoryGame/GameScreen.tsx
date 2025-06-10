import React, { useState, useEffect, useRef } from "react";
import { Alert, Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { saveScore, loadScores } from "../../utils/memoryGame/scoreStorage";

interface Card {
    id: number;
    name: string;
    image: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface SavedScore {
    time: number;
    moves: number;
    date: string;
}

type GameScreenProps = {
    setIsMemoryGameStarted: (value: boolean) => void;
};

const MemoryGameScreen: React.FC<GameScreenProps> = ({ setIsMemoryGameStarted }) => {
    const [scoreSaved, setScoreSaved] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const initialTwins = [
        {name: 'cowboy', image: '🤠',},
        {name: 'clown', image: '🤡',},
        {name: 'oni', image: '👹',},
        {name: 'monster', image: '👺',},
        {name: 'ghost', image: '👽',}, // Correction: '👻'
        {name: 'alien', image: '👾',}, // Correction: '👽' -> 👾
        {name: 'pirate', image: '☠️',},
        {name: 'robot', image: '🤖',},
    ];

    const createGameCards = () => {
        const cardsWithIds: Card[] = initialTwins.flatMap((card, index) => [
            { ...card, id: index * 2, isFlipped: false, isMatched: false },
            { ...card, id: index * 2 + 1, isFlipped: false, isMatched: false },
        ]);
        return cardsWithIds.sort(() => 0.5 - Math.random());
    };

    const [gameCards, setGameCards] = useState<Card[]>(createGameCards);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [matchedCardNames, setMatchedCardNames] = useState<string[]>([]);
    const [moves, setMoves] = useState(0);

    const delayBetweenFlips = 500;

    const resetGame = () => {
    setIsRunning(false);
    setTimeElapsed(0);
    setMoves(0);
    setFlippedIndices([]);
    setMatchedCardNames([]);
    setGameCards(createGameCards());
    setScoreSaved(false);
};

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeElapsed(prevTime => prevTime + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning]);

    useEffect(() => {
        if (flippedIndices.length === 2) {
            setMoves(prev => prev + 1);
            const [idx1, idx2] = flippedIndices;
            const card1 = gameCards[idx1];
            const card2 = gameCards[idx2];

            if (card1.name === card2.name) {
                setGameCards(prevCards =>
                    prevCards.map((card, idx) =>
                        idx === idx1 || idx === idx2 ? { ...card, isMatched: true } : card
                    )
                );
                setMatchedCardNames(prev => [...prev, card1.name]);
                setFlippedIndices([]);
            } else {
                setTimeout(() => {
                    setFlippedIndices([]);
                }, delayBetweenFlips);
            }
        }
    }, [flippedIndices, gameCards]);

    useEffect(() => {
    if (matchedCardNames.length === initialTwins.length && !scoreSaved) {
        setIsRunning(false);
        saveScore(timeElapsed, moves);
        setScoreSaved(true); // Marque le score comme sauvegardé
        Alert.alert("Congratulations !", `You found all the twins in ${timeElapsed} seconds and ${moves} moves!`, [
            { text: "Play Again", onPress: resetGame },
            { text: "Quit", onPress: () => setIsMemoryGameStarted(false) }
        ]);
    }
}, [matchedCardNames, timeElapsed, moves, scoreSaved, resetGame, setIsMemoryGameStarted]);


    const handleCardPress = (index: number) => {
        if (!isRunning) {
            setIsRunning(true);
        }
        if (flippedIndices.includes(index) || gameCards[index].isMatched) {
            return;
        }

        if (flippedIndices.length < 2) {
            setFlippedIndices(prev => [...prev, index]);
        }
    };

    return (
        <View style={styles.gameContainer}>
            <Text style={styles.gameTitle}>Find the twins !</Text>
            <Text style={styles.timerText}>Time: {timeElapsed}s | Moves: {moves}</Text>

            <View style={styles.gameBoard}>
                {gameCards.map((card: Card, index: number) => {
                    const isFlipped = flippedIndices.includes(index) || card.isMatched;
                    return (
                        <TouchableOpacity
                            key={card.id}
                            style={styles.card}
                            onPress={() => handleCardPress(index)}
                            disabled={isFlipped || flippedIndices.length === 2}
                        >
                            {isFlipped ? (
                                <Text style={styles.cardText}>{card.image}</Text>
                            ) : (
                                <Image
                                    source={require("../../assets/memoryGame/back.png")}
                                    style={styles.cardImageBack}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                style={[styles.gameControlButton, { backgroundColor: '#0000ff' }]}
                onPress={() => {
                    loadScores().then(scores => {
                        Alert.alert("High Scores", scores.map((score, index) => `${index + 1}. ${score.time}s - ${score.moves} moves`).join('\n'));
                    });
                }}>
                <Text style={styles.gameControlButtonText}>HighScores</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.gameControlButton, styles.bottomLeft]}
                onPress={resetGame}
            >
                <Text style={styles.gameControlButtonText}>Restart Game</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.gameControlButton, { backgroundColor: '#f44336' }, styles.bottomRight]}
                onPress={() =>
                    Alert.alert(
                        "Quit the game ?",
                        "Are you sure ?",
                        [
                            { text: "No", style: "cancel" },
                            { text: "Yes", onPress: () => setIsMemoryGameStarted(false) }
                        ]
                    )
                }
            >
                <Text style={styles.gameControlButtonText}>Quit Game</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    gameContainer: {
        flex: 1,
        backgroundColor: '#e8f5e9',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 100,
        padding: 10,
    },
    gameTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#2e7d32',
    },
    timerText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    gameBoard: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '70%',
        maxWidth: 400,
        padding: 5,
        backgroundColor: '#a5d6a7',
        borderRadius: 10,
        marginBottom: 20,
        aspectRatio: 1,
    },
    card: {
        width: '22%',
        aspectRatio: 0.7,
        backgroundColor: '#66bb6a',
        margin: '1.5%',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    cardImageBack: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain',
    },
    cardText: {
        fontSize: 40,
    },
    gameControlButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    gameControlButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomLeft: {
        position: 'absolute',
        bottom: 10,
        left: 10,
    },
    bottomRight: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
});

export default MemoryGameScreen;
