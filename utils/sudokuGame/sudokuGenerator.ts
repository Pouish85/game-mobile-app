import { SudokuCell, SudokuGrid } from '../types/sudoku';

// --- PARTIE 1: Fonctions de validation de base ---

/**
 * Vérifie si un nombre peut être placé dans une case donnée (ligne, colonne, bloc 3x3).
 * @param board La grille de Sudoku actuelle (peut contenir des nulls).
 * @param row L'indice de la ligne.
 * @param col L'indice de la colonne.
 * @param num Le nombre à vérifier (1-9).
 * @returns true si le nombre peut être placé, false sinon.
 */
function isValid(board: (number | null)[][], row: number, col: number, num: number): boolean {
    // Vérifier la ligne
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) {
            return false;
        }
    }

    // Vérifier la colonne
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) {
            return false;
        }
    }

    // Vérifier le bloc 3x3
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) {
                return false;
            }
        }
    }

    return true;
}

// --- PARTIE 2: Algorithme de résolution (Backtracking) ---

/**
 * Résout une grille de Sudoku en utilisant le backtracking.
 * @param board La grille de Sudoku à résoudre.
 * @returns true si une solution est trouvée, false sinon. La grille est modifiée en place.
 */
function solveSudoku(board: (number | null)[][]): boolean {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === null) { // Si la case est vide
                const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                // Shuffle pour obtenir des solutions différentes si plusieurs existent
                numbers.sort(() => Math.random() - 0.5);

                for (const num of numbers) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num; // Essayer de placer le nombre
                        if (solveSudoku(board)) { // Appeler récursivement pour la suite
                            return true; // Si la suite est résolue, on a une solution
                        } else {
                            board[row][col] = null; // Sinon, annuler le placement (backtrack)
                        }
                    }
                }
                return false; // Aucun nombre ne convient pour cette case, échec
            }
        }
    }
    return true; // Toutes les cases sont remplies, la solution est trouvée
}

// --- PARTIE 3: Génération d'une grille de Sudoku pleine ---

/**
 * Génère une grille de Sudoku complètement remplie et valide.
 * @returns Une grille 9x9 remplie de nombres.
 */
function generateFullSudoku(): (number | null)[][] {
    const board: (number | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
    solveSudoku(board); // Remplir la grille en utilisant l'algorithme de résolution
    return board;
}

// --- PARTIE 4: Création du puzzle (suppression de cellules) ---

/**
 * Crée un puzzle Sudoku en retirant des nombres d'une grille pleine.
 * Ne garantit pas une solution unique pour cette version simple.
 * @param fullBoard Une grille de Sudoku complètement remplie.
 * @param cellsToRemove Le nombre de cellules à vider.
 * @returns Un objet contenant le puzzle (SudokuGrid) et sa solution (SudokuGrid).
 */
export function generateSudokuPuzzle(difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium')
    : { puzzle: SudokuGrid; solution: SudokuGrid } {

    const fullBoardRaw = generateFullSudoku();
    const solutionRaw: (number | null)[][] = fullBoardRaw.map(row => [...row]); // Cloner la solution

    let cellsToRemove: number;
    switch (difficulty) {
        case 'easy':
            cellsToRemove = 40; // ~40-45 vides
            break;
        case 'medium':
            cellsToRemove = 50; // ~50-55 vides
            break;
        case 'hard':
            cellsToRemove = 58; // ~58-62 vides
            break;
        case 'expert':
            cellsToRemove = 65; // ~65+ vides
            break;
        default:
            cellsToRemove = 50; // Défaut
    }

    const puzzleRaw: (number | null)[][] = fullBoardRaw.map(row => [...row]); // Commencer avec la grille pleine

    let removedCount = 0;
    const allCells: { row: number, col: number }[] = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            allCells.push({ row: r, col: c });
        }
    }
    allCells.sort(() => Math.random() - 0.5); // Mélanger l'ordre de suppression

    for (const { row, col } of allCells) {
        if (removedCount >= cellsToRemove) break;

        const originalValue = puzzleRaw[row][col];
        if (originalValue === null) continue; // Skip if already empty

        puzzleRaw[row][col] = null; // Essayer de vider la case

        // Pour garantir une solution unique, il faudrait relancer un solveur et compter les solutions.
        // Pour une version simple, on suppose qu'en vidant un certain nombre de cases, ça reste jouable.
        // C'est la partie la plus difficile à implémenter sans librairie externe ou algorithme plus complexe.

        removedCount++;
    }

    // Transformer les grilles brutes en format SudokuGrid (avec isInitial, etc.)
    const convertRawToSudokuGrid = (rawBoard: (number | null)[][], isInitialCheck: boolean): SudokuGrid => {
        return rawBoard.map(row =>
            row.map(cellValue => ({
                value: cellValue,
                isInitial: isInitialCheck ? cellValue !== null : false, // Est initial si non null dans le puzzle
                isHighlighted: false,
                isError: false,
            }))
        );
    };

    return {
        puzzle: convertRawToSudokuGrid(puzzleRaw, true),
        solution: convertRawToSudokuGrid(solutionRaw, false) // La solution n'a pas de cellules "initiales"
    };
}

// Helper pour l'affichage (optionnel, pour debugger)
export function printBoard(board: (number | null)[][]): void {
    console.log("-------------------------");
    for (let i = 0; i < 9; i++) {
        let rowStr = "|";
        for (let j = 0; j < 9; j++) {
            rowStr += (board[i][j] === null ? " " : board[i][j]) + " ";
            if ((j + 1) % 3 === 0) {
                rowStr += "|";
            }
        }
        console.log(rowStr);
        if ((i + 1) % 3 === 0) {
            console.log("-------------------------");
        }
    }
}
