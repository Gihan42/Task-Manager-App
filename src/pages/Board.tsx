import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Plus, X } from 'lucide-react';
import { TextField, IconButton, Button as MuiButton } from '@mui/material';
import { Edit as EditIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Button } from '../components/ui/Button';
import { useBoard } from '../context/BoardContext';
import { useTeam } from '../context/TeamContext';

export const Board = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const { boards, addList, addTask, moveTask, moveList, updateTask } = useBoard();
    const { members } = useTeam();
    const [newListTitle, setNewListTitle] = useState('');
    const [isAddingList, setIsAddingList] = useState(false);
    const [addingCardToList, setAddingCardToList] = useState<string | null>(null);
    const [newCardContent, setNewCardContent] = useState('');
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const board = boards.find(b => b.id === boardId);

    // Filter members assigned to this board
    const boardMembers = members.filter(m => boardId && m.assignedBoardIds.includes(boardId));

    if (!board) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-bold mb-4">Board not found</h2>
                <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
            </div>
        );
    }

    const onDragEnd = (result: DropResult) => {
        const { destination, source, type } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (type === 'list') {
            moveList(board.id, source.index, destination.index);
            return;
        }

        moveTask(
            board.id,
            source.droppableId,
            destination.droppableId,
            source.index,
            destination.index
        );
    };

    const handleAddList = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;
        addList(board.id, newListTitle);
        setNewListTitle('');
        setIsAddingList(false);
    };

    const handleAddCard = (listId: string) => {
        if (!newCardContent.trim()) return;
        addTask(board.id, listId, newCardContent);
        setNewCardContent('');
        setAddingCardToList(null);
    };

    const startEditing = (cardId: string, content: string) => {
        setEditingCardId(cardId);
        setEditContent(content);
    };

    const saveCard = (listId: string, cardId: string) => {
        if (editContent.trim() !== '') {
            updateTask(board.id, listId, cardId, { content: editContent });
        }
        setEditingCardId(null);
        setEditContent('');
    };

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center justify-between mb-8 px-4 py-4 bg-background/60 backdrop-blur-md sticky top-0 z-10 border-b border-border/40 animate-slide-in-right">
                <div className="flex items-center gap-4">
                    <div 
                        className="w-10 h-10 rounded-xl shadow-lg ring-2 ring-offset-2 ring-offset-background transition-transform hover:scale-110 duration-300" 
                        style={{ backgroundColor: board.color, '--tw-ring-color': board.color } as React.CSSProperties} 
                    />
                    <div className="space-y-0.5">
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 animate-fade-in">
                            {board.title}
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Last updated just now
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <Button variant="outline" size="sm" className="hidden sm:flex hover:bg-muted/80 shadow-sm border-dashed">
                        Filter
                    </Button>
                    <div className="h-6 w-px bg-border hidden sm:block"></div>
                    <Button variant="outline" size="sm" className="shadow-sm hover:border-primary/50 transition-colors">
                        Share board
                    </Button>
                    <Button size="sm" className="shadow-md bg-primary hover:bg-primary/90 transition-all hover:scale-105">
                        <MoreHorizontal size={16} />
                    </Button>
                </div>
            </header>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="all-lists" direction="horizontal" type="list">
                    {(provided) => (
                        <div 
                            className="flex-1 overflow-x-auto pb-4"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <div className="flex gap-6 h-full min-w-max px-2 ">
                                {board.lists.map((list, index) => (
                                    <Draggable key={list.id} draggableId={list.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`w-72 bg-muted/50 rounded-lg flex flex-col gap-2 border border-border max-h-full ${snapshot.isDragging ? 'shadow-lg ring-2 m-2 ring-primary opacity-90' : ''}`}
                                            >
                                                <div 
                                                    className="p-3 font-semibold text-sm flex justify-between items-center cursor-move"
                                                    {...provided.dragHandleProps}
                                                >
                                                    {list.title}
                                                    <span className="text-xs text-muted-foreground font-normal bg-background/50 px-2 py-0.5 rounded-full">{list.cards.length}</span>
                                                </div>

                                                <Droppable droppableId={list.id} type="task">
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className={`flex-1 overflow-y-auto px-2 min-h-[0.5rem] p-2 flex flex-col gap-2 ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-md' : ''}`}
                                                        >
                                                            {list.cards.map((card, index) => (
                                                                <Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled={editingCardId === card.id}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                             className={`bg-card/40 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-border/40 text-sm hover:border-primary/70 hover:shadow-lg transition-all ${snapshot.isDragging ? 'shadow-2xl rotate-2 bg-card/60' : ''}`}
                                                                        >
                                                                            <div className="mb-3 group relative">
                                                                                {editingCardId === card.id ? (
                                                                                    <div className="flex gap-2 items-start">
                                                                                        <TextField 
                                                                                            fullWidth
                                                                                            multiline
                                                                                            size="small"
                                                                                            value={editContent}
                                                                                            onChange={(e) => setEditContent(e.target.value)}
                                                                                            autoFocus
                                                                                            sx={{
                                                                                                '& .MuiInputBase-root': { 
                                                                                                    color: 'hsl(var(--foreground))',
                                                                                                    backgroundColor: 'hsl(var(--background))',
                                                                                                    fontSize: '0.875rem',
                                                                                                },
                                                                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--primary))' },
                                                                                            }}
                                                                                            onKeyDown={(e) => {
                                                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                                                    e.preventDefault();
                                                                                                    saveCard(list.id, card.id);
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                        <div className="flex flex-col">
                                                                                            <IconButton 
                                                                                                onClick={() => saveCard(list.id, card.id)}
                                                                                                size="small"
                                                                                                className="text-emerald-700 dark:text-green-400 hover:text-emerald-800 dark:hover:text-green-300 hover:bg-emerald-500/10"
                                                                                            >
                                                                                                <CheckIcon fontSize="small" />
                                                                                            </IconButton>
                                                                                            <IconButton 
                                                                                                onClick={() => setEditingCardId(null)}
                                                                                                size="small"
                                                                                                className="text-slate-700 dark:text-white hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10"
                                                                                            >
                                                                                                <CloseIcon fontSize="small" />
                                                                                            </IconButton>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex justify-between items-start gap-2">
                                                                                        <span className="break-words w-full">{card.content}</span>
                                                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                                            <IconButton 
                                                                                                onClick={() => startEditing(card.id, card.content)}
                                                                                                size="small"
                                                                                                className="text-slate-700 dark:text-white hover:text-primary hover:bg-primary/10"
                                                                                            >
                                                                                                <EditIcon fontSize="small" />
                                                                                            </IconButton>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex flex-col gap-2 pt-2 border-t border-border/50 text-xs">
                                                                                <div className="flex justify-between items-center text-muted-foreground">
                                                                                    <span>Owner: {card.owner}</span>
                                                                                </div>
                                                                                <div className="flex flex-col gap-1">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-muted-foreground">Assignee:</span>
                                                                                        <select
                                                                                            className="bg-background border border-input rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:bg-muted/50 transition-colors"
                                                                                            value={card.assignee || ''}
                                                                                            onChange={(e) => updateTask(board.id, list.id, card.id, { assignee: e.target.value })}
                                                                                            onMouseDown={(e) => e.stopPropagation()} 
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                        >
                                                                                            <option value="">Unassigned</option>
                                                                                            {boardMembers.map(member => (
                                                                                                <option key={member.id} value={member.name}>{member.name}</option>
                                                                                            ))}
                                                                                        </select>
                                                                                    </div>
                                                                                    
                                                                                    {/* Stage-specific Metadata */}
                                                                                    <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                                                                        {/* Show Assigned info everywhere except Done (per 'show only done date' request) */}
                                                                                        {list.title !== 'Done' && card.assignee && card.assignedBy && (
                                                                                             <div>Assigned by {card.assignedBy} {card.assignedAt && `on ${new Date(card.assignedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}`}</div>
                                                                                        )}

                                                                                        {list.title === 'In Progress' && card.inProgressAt && (
                                                                                            <div className="text-blue-400">In Progress: {new Date(card.inProgressAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
                                                                                        )}

                                                                                        {list.title === 'Testing' && card.testingAt && (
                                                                                            <div className="text-orange-400">Testing Started: {new Date(card.testingAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
                                                                                        )}

                                                                                        {list.title === 'Done' && card.doneAt && (
                                                                                            <div className="text-green-500 font-medium">Completed: {new Date(card.doneAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                            
                                                            {addingCardToList === list.id ? (
                                                                <div className="p-1 animate-in slide-in-from-top-2 duration-200">
                                                                    <textarea
                                                                        autoFocus
                                                                        className="w-full p-2 mb-2 text-sm rounded border border-input bg-background resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                                                                        placeholder="Enter a title for this card..."
                                                                        rows={3}
                                                                        value={newCardContent}
                                                                        onChange={(e) => setNewCardContent(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if(e.key === 'Enter' && !e.shiftKey) {
                                                                                e.preventDefault();
                                                                                handleAddCard(list.id);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <div className="flex items-center gap-2">
                                                                        <Button size="sm" onClick={() => handleAddCard(list.id)}>Add Card</Button>
                                                                        <Button size="sm" variant="ghost" onClick={() => {
                                                                            setAddingCardToList(null); 
                                                                            setNewCardContent('');
                                                                        }}>
                                                                            <X size={16} />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <MuiButton 
                                                                    fullWidth
                                                                    size="small" 
                                                                    onClick={() => setAddingCardToList(list.id)}
                                                                    sx={{ 
                                                                        justifyContent: 'center',
                                                                        borderRadius: '8px',
                                                                        backgroundColor: '#1c2c44ff', // slate-900
                                                                        color: 'white',
                                                                        '&:hover': {
                                                                            backgroundColor: '#1c2c44ff', // slate-800
                                                                        },
                                                                        // Dark mode override
                                                                        'html.dark &': {
                                                                            backgroundColor: '#374151', // gray-700
                                                                            color: '#e5e7eb', // gray-200
                                                                        },
                                                                        'html.dark &:hover': {
                                                                            backgroundColor: '#4b5563', // gray-600
                                                                        }
                                                                    }}
                                                                >
                                                                   + Add a card
                                                                </MuiButton>
                                                            )}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}

                                <div className="w-72 shrink-0">
                                    {isAddingList ? (
                                        <form onSubmit={handleAddList} className="bg-card/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-lg animate-in slide-in-from-right-4 duration-200">
                                            <div className="mb-3">
                                                <TextField
                                                    autoFocus
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    label="List Title"
                                                    placeholder="Enter list title..."
                                                    value={newListTitle}
                                                    onChange={(e) => setNewListTitle(e.target.value)}
                                                    sx={{
                                                        '& .MuiInputBase-root': { 
                                                            color: 'hsl(var(--foreground))',
                                                            backgroundColor: 'hsl(var(--background))',
                                                        },
                                                        '& .MuiInputLabel-root': { color: 'hsl(var(--muted-foreground))' },
                                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--border))' },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--primary))' },
                                                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--primary))' },
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 justify-end">
                                                <Button size="sm" variant="ghost" onClick={() => {
                                                    setIsAddingList(false);
                                                    setNewListTitle('');
                                                }}>
                                                    Cancel
                                                </Button>
                                                <Button size="sm" type="submit">Add List</Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button 
                                            onClick={() => setIsAddingList(true)}
                                            className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed border-border text-sm font-medium transition-all bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-sm hover:shadow-md"
                                        >
                                            <Plus size={16} />
                                            Add another list
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};
