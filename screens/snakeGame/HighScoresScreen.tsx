import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { loadScores } from '../../utils/memoryGame/scoreStorage';

interface SavedScore {
    time: number;
    moves: number;
    date: string;
}

const HighScoresScreen: React.FC = () => {
    const [scores, setScores] = useState<SavedScore[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            const loadedScores = await loadScores();
            setScores(loadedScores);
            setIsLoading(false);
        };
        fetchScores();
    }, []);

    if (isLoading) {
        return <Text>Loading scores...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meilleurs Scores</Text>
            {scores.length === 0 ? (
                <Text>Aucun score enregistré pour le moment.</Text>
            ) : (
                <FlatList
                    data={scores}
                    keyExtractor={(item, index) => item.date + index}
                    renderItem={({ item, index }) => (
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreRank}>{index + 1}.</Text>
                            <Text style={styles.scoreText}>Temps: {item.time}s</Text>
                            <Text style={styles.scoreText}>Coups: {item.moves}</Text>
                            <Text style={styles.scoreDate}>({new Date(item.date).toLocaleDateString()})</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e8f5e9',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2e7d32',
    },
    scoreItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#a5d6a7',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        width: '100%',
        maxWidth: 300,
    },
    scoreRank: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
        color: '#333',
    },
    scoreText: {
        fontSize: 16,
        color: '#333',
    },
    scoreDate: {
        fontSize: 12,
        color: '#555',
        marginLeft: 10,
    },
});

export default HighScoresScreen;
