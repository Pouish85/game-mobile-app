import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedScore {
    time: number;
    moves: number;
    date: string;
}

const STORAGE_KEY = 'memoryGameHighScores';

export const saveScore = async (newTime: number, newMoves: number): Promise<void> => {
    try {
        const storedScoresJson = await AsyncStorage.getItem(STORAGE_KEY);
        let storedScores: SavedScore[] = storedScoresJson ? JSON.parse(storedScoresJson) : [];

        const newScore: SavedScore = {
            time: newTime,
            moves: newMoves,
            date: new Date().toISOString(),
        };

        storedScores.push(newScore);
        storedScores.sort((a, b) => {
            if (a.time !== b.time) {
                return a.time - b.time;
            }
            return a.moves - b.moves;
        });

        storedScores = storedScores.slice(0, 5);

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedScores));
        console.log('Score saved successfully!');
    } catch (e) {
        console.error('Failed to save score:', e);
    }
};

export const loadScores = async (): Promise<SavedScore[]> => {
    try {
        const storedScoresJson = await AsyncStorage.getItem(STORAGE_KEY);
        const storedScores: SavedScore[] = storedScoresJson ? JSON.parse(storedScoresJson) : [];
        console.log('Loaded scores:', storedScores);
        return storedScores;
    } catch (e) {
        console.error('Failed to load scores:', e);
        return [];
    }
};
