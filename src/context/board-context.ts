
import { createContext } from 'react';
import type { Board, List, Task } from '../types';

export interface BoardContextType {
    boards: Board[];
    createBoard: (title: string, color: string) => void;
    addList: (boardId: string, title: string) => void;
    addTask: (boardId: string, listId: string, content: string) => void;
    moveTask: (boardId: string, sourceListId: string, destListId: string, sourceIndex: number, destIndex: number, movedBy?: string) => void;
    moveList: (boardId: string, sourceIndex: number, destIndex: number) => void;
    reorderLists: (boardId: string, newLists: List[]) => void;
    updateTaskOrder: (boardId: string, listId: string, newTasks: Task[]) => void;
    updateTask: (boardId: string, listId: string, taskId: string, updates: Partial<Task>) => void;
    updateBoard: (boardId: string, updates: Partial<Board>) => void;
    deleteBoard: (boardId: string) => Promise<void>;
}

export const BoardContext = createContext<BoardContextType>({
    boards: [],
    createBoard: () => {},
    addList: () => {},
    addTask: () => {},
    moveTask: () => {},
    moveList: () => {},
    reorderLists: () => {},
    updateTaskOrder: () => {},
    updateTask: () => {},
    updateBoard: () => {},
    deleteBoard: async () => {},
});

