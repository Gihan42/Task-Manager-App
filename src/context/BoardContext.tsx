import React, { useState, useEffect } from 'react';
import type { Board, List, Task } from '../types';
import { BoardContext } from './board-context';
import defaultRoles from '../data/roles.json';
import { collection, onSnapshot, doc, updateDoc, query, writeBatch, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [boards, setBoards] = useState<Board[]>([]);
    const { user } = useAuth();
    const toast = useToast();

    useEffect(() => {
        // Only query Firestore when user is authenticated
        if (!user) {
            setBoards([]);
            return;
        }

        const q = query(collection(db, "projects"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Board[];
            setBoards(projectsData);
        }, (error) => {
            // Only show error if it's not a permission error during logout transition
            if (user) {
                toast.error(`Failed to load projects: ${error.message}`);
            }
        });

        return () => unsubscribe();
    }, [user, toast]);

    const createBoard = async (title: string, color: string) => {
        if (!user) {
            toast.error("Please log in to create a board");
            return;
        }

        const batch = writeBatch(db);
        const newBoardRef = doc(collection(db, "projects"));
        const newBoardId = newBoardRef.id;

        const newBoard: Board = {
            id: newBoardId,
            title,
            color,
            lists: [],
            ownerId: user.uid,
            members: [user.uid]
        };

        batch.set(newBoardRef, newBoard);

        const userProjectRef = doc(collection(db, "user_projects"));
        batch.set(userProjectRef, {
            userId: user.uid,
            projectId: newBoardId,
            role: defaultRoles.availableRoles[0] || 'Owner',
            assignedAt: new Date().toISOString()
        });

        try {
            await batch.commit();
            toast.success(`Board "${title}" created successfully!`);
        } catch (error: any) {
            toast.error(`Failed to create board: ${error.message}`);
        }
    };

    const updateBoard = async (boardId: string, updates: Partial<Board>) => {
        try {
            await updateDoc(doc(db, "projects", boardId), updates);
        } catch (error: any) {
            toast.error(`Failed to update board: ${error.message}`);
        }
    };

    const addList = async (boardId: string, title: string) => {
        const board = boards.find(b => b.id === boardId);
        if (!board) return;

        const newLists = [
            ...board.lists,
            {
                id: crypto.randomUUID(),
                title,
                cards: []
            }
        ];

        try {
            await updateDoc(doc(db, "projects", boardId), { lists: newLists });
            toast.success(`List "${title}" added`);
        } catch (error: any) {
            toast.error(`Failed to add list: ${error.message}`);
        }
    };

    const addTask = async (boardId: string, listId: string, content: string) => {
        const board = boards.find(b => b.id === boardId);
        if (!board) return;

        const newLists = board.lists.map(list => {
            if (list.id !== listId) return list;
            return {
                ...list,
                cards: [
                    ...list.cards,
                    { 
                        id: crypto.randomUUID(), 
                        content, 
                        owner: 'Current User',
                        createdAt: new Date().toISOString()
                    }
                ]
            };
        });

        try {
            await updateDoc(doc(db, "projects", boardId), { lists: newLists });
        } catch (error: any) {
            toast.error(`Failed to add task: ${error.message}`);
        }
    };

    const updateTask = async (boardId: string, listId: string, taskId: string, updates: Partial<Task>) => {
        const board = boards.find(b => b.id === boardId);
        if (!board) return;

        const newLists = board.lists.map(list => {
            if (list.id !== listId) return list;
            return {
                ...list,
                cards: list.cards.map(card => {
                    if (card.id !== taskId) return card;
                    
                    const finalUpdates = { ...updates };
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
        });

        try {
            await updateDoc(doc(db, "projects", boardId), { lists: newLists });
        } catch (error: any) {
            toast.error(`Failed to update task: ${error.message}`);
        }
    };

    const moveTask = async (boardId: string, sourceListId: string, destListId: string, sourceIndex: number, destIndex: number) => {
        const board = boards.find(b => b.id === boardId);
        if (!board) return;
        
        let newLists = [...board.lists];

        const sourceList = newLists.find(l => l.id === sourceListId);
        const destList = newLists.find(l => l.id === destListId);

        if (!sourceList || !destList) return;

        const newSourceCards = Array.from(sourceList.cards);
        const [movedTask] = newSourceCards.splice(sourceIndex, 1);

        if (sourceListId === destListId) {
            newSourceCards.splice(destIndex, 0, movedTask);
            
            newLists = newLists.map(l => 
                l.id === sourceListId ? { ...l, cards: newSourceCards } : l
            );
        } else {
            const newDestCards = Array.from(destList.cards);
             const now = new Date().toISOString();
             const updatedTask = { ...movedTask };

             if (destList.title === 'To Do') {
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

            newDestCards.splice(destIndex, 0, updatedTask);

            newLists = newLists.map(l => {
                if (l.id === sourceListId) return { ...l, cards: newSourceCards };
                if (l.id === destListId) return { ...l, cards: newDestCards };
                return l;
            });
        }

        try {
            await updateDoc(doc(db, "projects", boardId), { lists: newLists });
        } catch (error: any) {
            toast.error(`Failed to move task: ${error.message}`);
        }
    };

    const moveList = async (boardId: string, sourceIndex: number, destIndex: number) => {
        const board = boards.find(b => b.id === boardId);
        if (!board) return;

        const newLists = Array.from(board.lists);
        const [movedList] = newLists.splice(sourceIndex, 1);
        newLists.splice(destIndex, 0, movedList);

        try {
            await updateDoc(doc(db, "projects", boardId), { lists: newLists });
        } catch (error: any) {
            toast.error(`Failed to move list: ${error.message}`);
        }
    };

    const reorderLists = async (boardId: string, newLists: List[]) => {
        try {
            await updateDoc(doc(db, "projects", boardId), { lists: newLists });
        } catch (error: any) {
            toast.error(`Failed to reorder lists: ${error.message}`);
        }
    };

    const updateTaskOrder = async (boardId: string, listId: string, newTasks: Task[]) => {
        const board = boards.find(b => b.id === boardId);
        if (!board) return;

        const newLists = board.lists.map(list => 
            list.id === listId ? { ...list, cards: newTasks } : list
        );

        try {
            await updateDoc(doc(db, "projects", boardId), { lists: newLists });
        } catch (error: any) {
            toast.error(`Failed to update task order: ${error.message}`);
        }
    };

    const deleteBoard = async (boardId: string) => {
        if (!user) {
             toast.error("Please log in to delete a board");
             return;
        }

        try {
            const batch = writeBatch(db);

            const projectRef = doc(db, "projects", boardId);
            batch.delete(projectRef);

            const userProjectsRef = collection(db, "user_projects");
            const q = query(userProjectsRef, where("projectId", "==", boardId));
            const snapshot = await getDocs(q);
            
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            toast.success("Board deleted successfully");
        } catch (error: any) {
            toast.error(`Failed to delete board: ${error.message}`);
        }
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
            updateTask,
            updateBoard,
            deleteBoard
        }}>
            {children}
        </BoardContext.Provider>
    );
};
