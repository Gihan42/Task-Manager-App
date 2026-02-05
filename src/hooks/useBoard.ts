import { useContext } from 'react';
import { BoardContext } from '../context/board-context';

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error('useBoard must be used within a BoardProvider');
    }
    return context;
};
