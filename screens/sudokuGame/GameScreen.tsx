import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { SudokuCell, SudokuGrid } from '../../types/sudoku';
import { generateSudokuPuzzle } from '../../utils/sudokuGame/sudokuGenerator';


interface SavedScore {
    time: number;
    moves: number;
    date: string;
}

type GameScreenProps = {
    setIsSudokuGameStarted: (value: boolean) => void;
};

const SudokuGameScreen: React.FC<GameScreenProps> = ({ setIsSudokuGameStarted }) => {
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [gameGrid, setGameGrid] = useState<SudokuGrid>([]);
    const [solutionGrid, setSolutionGrid] = useState<SudokuGrid>([]);
    const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
    const [isGameComplete, setIsGameComplete] = useState(false);

    const startNewGame = () => {
        setIsRunning(false); // S'assurer que le timer est arrêté avant de générer
        setTimeElapsed(0);
        setIsGameComplete(false);
        setSelectedCell(null);

        // Générer une nouvelle grille
        const { puzzle, solution } = generateSudokuPuzzle('easy'); // Choisissez la difficulté
        setGameGrid(puzzle);
        setSolutionGrid(solution);
        setIsRunning(true); // Démarre le timer dès que la grille est prête
    };

    useEffect(() => {
        startNewGame();
    }, []); // Le tableau vide assure que cela ne s'exécute qu'une fois au montage

    // Logique du timer (identique à celle du jeu de mémoire)
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

    // Gère le clic sur une cellule
    const handleCellPress = (rowIndex: number, colIndex: number) => {
        // Ne peut pas sélectionner les cellules initiales
        if (gameGrid[rowIndex][colIndex].isInitial) {
            setSelectedCell(null); // Désélectionner si c'est une case initiale
        } else {
            setSelectedCell({ row: rowIndex, col: colIndex });
        }
    };

    // Gère le clic sur le clavier numérique
    const handleNumpadPress = (num: number | 'C') => {
        if (!selectedCell || gameGrid[selectedCell.row][selectedCell.col].isInitial) {
            return; // Pas de cellule sélectionnée ou cellule initiale
        }

        const { row, col } = selectedCell;
        let newValue: number | null = null;

        if (num === 'C') { // Si le bouton "Clear" est pressé
            newValue = null;
        } else {
            newValue = num;
        }

        // Mettre à jour la grille de jeu
        setGameGrid(prevGrid => {
            const newGrid = prevGrid.map(r => [...r]); // Cloner la grille pour ne pas muter l'état directement
            const cell = newGrid[row][col];

            cell.value = newValue;
            // Vérifier si la saisie est correcte par rapport à la solution (pour marquer les erreurs)
            cell.isError = newValue !== null && solutionGrid[row][col].value !== newValue;

            return newGrid;
        });

        // Vérifier si la grille est complète et valide après chaque saisie
        checkGameCompletion();
    };

    // Vérifie si la grille est entièrement remplie et valide
    const checkGameCompletion = () => {
        let complete = true;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                // Vérifier si toutes les cellules sont remplies ET si elles correspondent à la solution
                if (gameGrid[r][c].value === null || gameGrid[r][c].value !== solutionGrid[r][c].value) {
                    complete = false;
                    break;
                }
            }
            if (!complete) break;
        }

        if (complete) {
            setIsRunning(false); // Arrêter le timer
            setIsGameComplete(true); // Marquer le jeu comme complet

            // Sauvegarder le score (vous pouvez adapter la fonction saveScore du Memory Game)
            // saveScore(timeElapsed, /* par ex. nb d'erreurs si vous les comptez */ 0);

            Alert.alert(
                "Félicitations !",
                `Vous avez résolu le Sudoku en ${timeElapsed} secondes !`,
                [
                    { text: "Rejouer", onPress: startNewGame },
                    { text: "Quitter", onPress: () => setIsSudokuGameStarted(false) }
                ]
            );
        }
    };

    // Utilisez un useEffect pour déclencher checkGameCompletion lorsque gameGrid change
    // Attention : ne pas faire de vérification trop coûteuse à chaque changement
    useEffect(() => {
        // Optimisation : ne vérifier la complétion que si la grille est pleine, ou si le jeu est déjà complet
        // Ou déclenchez-le après une saisie, comme fait dans handleNumpadPress
        // Ici, il pourrait vérifier si l'état `isGameComplete` doit passer à `true`
    }, [gameGrid]); // Déclenchez si gameGrid change

    // --- Rendu UI ---
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sudoku</Text>
            <Text style={styles.timerText}>Time: {timeElapsed}s</Text>

            <View style={styles.sudokuBoard}>
                {gameGrid.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.sudokuRow}>
                        {row.map((cell, colIndex) => (
                            <TouchableOpacity
                                key={`${rowIndex}-${colIndex}`}
                                style={[
                                    styles.sudokuCell,
                                    cell.isInitial && styles.initialCell,
                                    selectedCell?.row === rowIndex && selectedCell?.col === colIndex && styles.selectedCell,
                                    cell.isError && styles.errorCell,
                                    // Bordures pour les blocs 3x3
                                    rowIndex % 3 === 2 && rowIndex !== 8 && styles.borderBottomThick,
                                    colIndex % 3 === 2 && colIndex !== 8 && styles.borderRightThick,
                                ]}
                                onPress={() => handleCellPress(rowIndex, colIndex)}
                                disabled={cell.isInitial || isGameComplete} // Désactiver les cellules initiales et toutes les cellules si le jeu est complet
                            >
                                <Text style={[styles.cellText, cell.isInitial && styles.initialCellText]}>
                                    {cell.value !== null ? cell.value : ''}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>

            {/* Clavier numérique */}
            {selectedCell && !gameGrid[selectedCell.row][selectedCell.col].isInitial && !isGameComplete && (
                <View style={styles.numpad}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C'].map(num => (
                        <TouchableOpacity key={num} style={styles.numpadButton} onPress={() => handleNumpadPress(num as number | 'C')}>
                            <Text style={styles.numpadButtonText}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Boutons de contrôle */}
            <TouchableOpacity
                style={styles.controlButton}
                onPress={startNewGame} // Bouton pour recommencer
                disabled={isGameComplete && false} // Si le jeu est complet, on peut recommencer
            >
                <Text style={styles.controlButtonText}>Recommencer</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: '#f44336' }]}
                onPress={() =>
                    Alert.alert(
                        "Quitter le Sudoku ?",
                        "Êtes-vous sûr(e) ?",
                        [
                            { text: "Non", style: "cancel" },
                            { text: "Oui", onPress: () => setIsSudokuGameStarted(false) }
                        ]
                    )
                }
            >
                <Text style={styles.controlButtonText}>Quitter</Text>
            </TouchableOpacity>
        </View>
    );
};

// --- Styles pour le Sudoku ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8f5e9',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    title: {
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
    sudokuBoard: {
        width: 300, // Largeur fixe pour une grille 9x9
        height: 300, // Hauteur fixe
        borderWidth: 2,
        borderColor: '#333',
        marginBottom: 20,
    },
    sudokuRow: {
        flexDirection: 'row',
        flex: 1, // Chaque ligne prend 1/9 de la hauteur
    },
    sudokuCell: {
        flex: 1, // Chaque cellule prend 1/9 de la largeur
        borderWidth: 0.5,
        borderColor: '#999',
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: 1, // Assure que les cellules sont carrées
    },
    cellText: {
        fontSize: 20,
        fontWeight: 'normal',
        color: '#333',
    },
    initialCell: {
        backgroundColor: '#d3e0d3', // Fond pour les chiffres initiaux
    },
    initialCellText: {
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    selectedCell: {
        backgroundColor: '#a7d9a7', // Couleur de la cellule sélectionnée
        borderColor: '#2e7d32',
        borderWidth: 2,
    },
    errorCell: {
        backgroundColor: '#ffcdd2', // Rouge clair pour les erreurs
        color: '#d32f2f', // Texte rouge foncé pour les erreurs
    },
    borderBottomThick: {
        borderBottomWidth: 3,
        borderBottomColor: '#333',
    },
    borderRightThick: {
        borderRightWidth: 3,
        borderRightColor: '#333',
    },
    numpad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: 300,
        marginBottom: 20,
    },
    numpadButton: {
        width: 60,
        height: 60,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        borderRadius: 10,
        elevation: 3,
    },
    numpadButtonText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    controlButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    controlButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SudokuGameScreen;
