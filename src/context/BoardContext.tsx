import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Board, List, Task } from '../types';

interface BoardContextType {
    boards: Board[];
    createBoard: (title: string, color: string) => void;
    addList: (boardId: string, title: string) => void;
    addTask: (boardId: string, listId: string, content: string) => void;
    moveTask: (boardId: string, sourceListId: string, destListId: string, sourceIndex: number, destIndex: number) => void;
    moveList: (boardId: string, sourceIndex: number, destIndex: number) => void;
    reorderLists: (boardId: string, newLists: List[]) => void;
    updateTaskOrder: (boardId: string, listId: string, newTasks: Task[]) => void;
    updateTask: (boardId: string, listId: string, taskId: string, updates: Partial<Task>) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error('useBoard must be used within a BoardProvider');
    }
    return context;
};

// Initial data for demonstration only if storage is empty
const INITIAL_DATA: Board[] = [
    {
        id: '1',
        title: 'Product Roadmap',
        color: 'hsl(215 80% 60%)',
        lists: [
            {
                id: 'l1',
                title: 'To Do',
                cards: [
                    { id: 'c1', content: 'Research Competitors', owner: 'Product Owner' },
                    { id: 'c2', content: 'Draft Initial Designs', owner: 'Designer', assignee: 'Designer' }
                ]
            },
            {
                id: 'l2',
                title: 'In Progress',
                cards: [
                    { id: 'c3', content: 'Setup Project Repo', owner: 'Tech Lead', assignee: 'Developer' }
                ]
            },
            {
                id: 'l_testing',
                title: 'Testing',
                cards: []
            },
            {
                id: 'l3',
                title: 'Done',
                cards: []
            }
        ]
    }
];

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [boards, setBoards] = useState<Board[]>(() => {
        const saved = localStorage.getItem('taskflow-boards');
        return saved ? JSON.parse(saved) : INITIAL_DATA;
    });

    useEffect(() => {
        localStorage.setItem('taskflow-boards', JSON.stringify(boards));
    }, [boards]);

    const createBoard = (title: string, color: string) => {
        const newBoard: Board = {
            id: crypto.randomUUID(),
            title,
            color,
            lists: []
        };
        setBoards([...boards, newBoard]);
    };

    const addList = (boardId: string, title: string) => {
        setBoards(boards.map(board => {
            if (board.id !== boardId) return board;
            return {
                ...board,
                lists: [
                    ...board.lists,
                    {
                        id: crypto.randomUUID(),
                        title,
                        cards: []
                    }
                ]
            };
        }));
    };

    const addTask = (boardId: string, listId: string, content: string) => {
        setBoards(boards.map(board => {
            if (board.id !== boardId) return board;
            return {
                ...board,
                lists: board.lists.map(list => {
                    if (list.id !== listId) return list;
                    return {
                        ...list,
                        cards: [
                            ...list.cards,
                            { 
                                id: crypto.randomUUID(), 
                                content, 
                                owner: 'Current User' // Mock owner
                            }
                        ]
                    };
                })
            };
        }));
    };

    const updateTask = (boardId: string, listId: string, taskId: string, updates: Partial<Task>) => {
        setBoards(boards.map(board => {
            if (board.id !== boardId) return board;
            return {
                ...board,
                lists: board.lists.map(list => {
                    if (list.id !== listId) return list;
                    return {
                        ...list,
                        cards: list.cards.map(card => {
                            if (card.id !== taskId) return card;
                            
                            // Handle assignment metadata
                            let finalUpdates = { ...updates };
                            if ('assignee' in updates) {
                                if (updates.assignee) {
                                    finalUpdates.assignedAt = new Date().toISOString();
                                    finalUpdates.assignedBy = 'Current User';
                                } else {
                                    finalUpdates.assignedAt = undefined;
                                    finalUpdates.assignedBy = undefined;
                                }
                            }

                            return { ...card, ...finalUpdates };
                        })
                    };
                })
            };
        }));
    };

    const moveTask = (boardId: string, sourceListId: string, destListId: string, sourceIndex: number, destIndex: number) => {
        setBoards(prevBoards => prevBoards.map(board => {
            if (board.id !== boardId) return board;

            const sourceList = board.lists.find(l => l.id === sourceListId);
            const destList = board.lists.find(l => l.id === destListId);

            if (!sourceList || !destList) return board;

            // Create copies
            const newSourceCards = Array.from(sourceList.cards);
            const [movedTask] = newSourceCards.splice(sourceIndex, 1);

            if (sourceListId === destListId) {
                // Same list movement
                newSourceCards.splice(destIndex, 0, movedTask);
                return {
                    ...board,
                    lists: board.lists.map(l => 
                        l.id === sourceListId ? { ...l, cards: newSourceCards } : l
                    )
                };
            } else {
                // Different list movement
                
                // Update timestamps based on destination
                const now = new Date().toISOString();
                const updatedTask = { ...movedTask };

                if (destList.title === 'To Do') {
                    // Reset stage dates if moved back? Or keep history? 
                    // Requirement says "if has issue can move to any section", implying flexibility.
                    // We'll leave existing dates but maybe clear doneAt if moving out of done.
                    updatedTask.doneAt = undefined;
                    updatedTask.testingDoneAt = undefined;
                } else if (destList.title === 'In Progress') {
                    updatedTask.inProgressAt = now;
                    updatedTask.doneAt = undefined;
                } else if (destList.title === 'Testing') {
                    updatedTask.testingAt = now;
                    updatedTask.doneAt = undefined;
                } else if (destList.title === 'Done') {
                    updatedTask.doneAt = now;
                    if (sourceList.title === 'Testing') {
                        updatedTask.testingDoneAt = now;
                    }
                }

                const newDestCards = Array.from(destList.cards);
                newDestCards.splice(destIndex, 0, updatedTask);
                return {
                    ...board,
                    lists: board.lists.map(l => {
                        if (l.id === sourceListId) return { ...l, cards: newSourceCards };
                        if (l.id === destListId) return { ...l, cards: newDestCards };
                        return l;
                    })
                };
            }
        }));
    };

    const moveList = (boardId: string, sourceIndex: number, destIndex: number) => {
        setBoards(prevBoards => prevBoards.map(board => {
            if (board.id !== boardId) return board;
            const newLists = Array.from(board.lists);
            const [movedList] = newLists.splice(sourceIndex, 1);
            newLists.splice(destIndex, 0, movedList);
            return { ...board, lists: newLists };
        }));
    };

    const reorderLists = (boardId: string, newLists: List[]) => {
        setBoards(prev => prev.map(b => b.id === boardId ? { ...b, lists: newLists } : b));
    };

    const updateTaskOrder = (boardId: string, listId: string, newTasks: Task[]) => {
        setBoards(prev => prev.map(board => {
            if (board.id !== boardId) return board;
            return {
                ...board,
                lists: board.lists.map(list => 
                    list.id === listId ? { ...list, cards: newTasks } : list
                )
            };
        }));
    };


    return (
        <BoardContext.Provider value={{ 
            boards, 
            createBoard, 
            addList, 
            addTask, 
            moveTask, 
            moveList,
            reorderLists,
            updateTaskOrder,
            updateTask
        }}>
            {children}
        </BoardContext.Provider>
    );
};
