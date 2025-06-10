export interface SudokuCell {
    value: number | null;
    isInitial: boolean;
    isHighlighted: boolean;
    isError: boolean;
}

export type SudokuGrid = SudokuCell[][];
