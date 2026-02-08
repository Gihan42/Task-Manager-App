import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { TextField, IconButton, Button as MuiButton, Select, MenuItem, Checkbox, ListItemText, Avatar, Tooltip } from '@mui/material';
import { Edit as EditIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Button } from '../components/ui/Button';
import { useBoard } from '../hooks/useBoard';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../context/AuthContext';

export const Board = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const { boards, addList, addTask, moveTask, moveList, updateTask } = useBoard();
    const { members } = useTeam();
    const { user } = useAuth();
    const [newListTitle, setNewListTitle] = useState('');
    const [isAddingList, setIsAddingList] = useState(false);
    const [addingCardToList, setAddingCardToList] = useState<string | null>(null);
    const [newCardContent, setNewCardContent] = useState('');
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const board = boards.find(b => b.id === boardId);

    // Filter members assigned to this board
    const boardMembers = members.filter(m => boardId && m.assignedBoardIds.includes(boardId));

    // Permission check
    const allowedRoles = ['Project Manager', 'TechLead', 'Manager'];
    const currentUserMember = members.find(m => m.id === user?.uid);
    // Check if user has ANY of the allowed roles
    const hasPermission = currentUserMember?.roles.some(role => allowedRoles.includes(role)) ?? false;

    if (!board) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-bold mb-4">Project not found</h2>
                <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
            </div>
        );
    }

    const onDragEnd = (result: DropResult) => {
        // Permission check inside onDragEnd is redundant if isDragDisabled is correct, 
        // but good for safety. Update it to include assignees.
        // Doing strict check here might be complex because we need the cardId to check assignment.
        // Reliance on isDragDisabled is standard for dnd.
        // However, we still have the `if (!hasPermission) return;` at the top.
        // We need to remove that global block and check specifically.
        
        const { destination, source, type } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (type === 'list') {
            if (!hasPermission) return; // Only managers can move lists
            moveList(board.id, source.index, destination.index);
            return;
        }

        // For tasks, we rely on Draggable isDragDisabled, but we can double check if needed.
        // Pass current user name for tracking
        const movedByName = currentUserMember?.name || user?.displayName || 'Unknown';
        
        moveTask(
            board.id,
            source.droppableId,
            destination.droppableId,
            source.index,
            destination.index,
            movedByName
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
        if (!hasPermission) return;
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleAssigneeChange = (listId: string, cardId: string, selectedNames: string[]) => {
        updateTask(board.id, listId, cardId, { 
            assignees: selectedNames,
            assignedBy: currentUserMember?.name || user?.displayName || 'Unknown'
        });
    };

    return (
        <div className="h-full flex flex-col">
           {/* Header ... */}
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
    
                    </div>
                </div>
                <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                </div>
            </header>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="all-lists" direction="horizontal" type="list" isDropDisabled={!hasPermission}>
                    {(provided) => (
                        <div 
                            className="flex-1 overflow-x-auto pb-4"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <div className="flex gap-6 h-full min-w-max px-2 ">
                                {board.lists.map((list, index) => (
                                    <Draggable key={list.id} draggableId={list.id} index={index} isDragDisabled={!hasPermission}>
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

                                                <Droppable 
                                                    droppableId={list.id} 
                                                    type="task" 
                                                    // Drop disabled only impacts dropping INTO this list. 
                                                    // If we want to allow assignees to drop here, we should enable it.
                                                    // Actually, isDropDisabled prevents dropping anything INTO the droppable.
                                                    // Since we want to allow moves if user is assignee, we can't globally disable drop based ONLY on role.
                                                    // We must allow drop, and control via isDragDisabled on the draggable items.
                                                    // If I set isDropDisabled={!hasPermission}, then an assignee (who has permission to drag their card) 
                                                    // won't be able to drop it anywhere if they don't have the manager role.
                                                    // So we must REMOVE isDropDisabled={!hasPermission} from here to allow assignees to move cards.
                                                    // But we should keep it for the list droppable? 
                                                    // Actually, list reordering is handled by the outer Droppable. This is the inner Droppable for tasks.
                                                    isDropDisabled={false}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className={`flex-1 overflow-y-auto px-2 min-h-[0.5rem] p-2 flex flex-col gap-2 ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-md' : ''}`}
                                                        >
                                                            {list.cards.map((card, index) => {
                                                                const isAssigned = card.assignees?.includes(currentUserMember?.name || '');
                                                                const canMove = hasPermission || isAssigned;

                                                                return (
                                                                <Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled={editingCardId === card.id || !canMove}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                             className={`bg-card/40 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-border/40 text-sm hover:border-primary/70 hover:shadow-lg transition-all ${snapshot.isDragging ? 'shadow-2xl rotate-2 bg-card/60' : ''}`}
                                                                        >
                                                                            <div className="mb-3 group relative">
                                                                                {/* ... (Edit mode logic same as before) ... */}
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
                                                                                        {hasPermission && (
                                                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                                                <IconButton 
                                                                                                    onClick={() => startEditing(card.id, card.content)}
                                                                                                    size="small"
                                                                                                    className="text-slate-700 dark:text-white hover:text-primary hover:bg-primary/10"
                                                                                                >
                                                                                                    <EditIcon fontSize="small" />
                                                                                                </IconButton>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex flex-col gap-2 pt-2 border-t border-border/50 text-xs">
                    
                                                                                <div className="flex flex-col gap-1">
                                                                                    {hasPermission && (
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="text-muted-foreground">Assignees:</span>
                                                                                            {/* ... Select Component ... */}
                                                                                             <Select
                                                                                                multiple
                                                                                                value={card.assignees || []}
                                                                                                onChange={(e) => {
                                                                                                    const value = e.target.value;
                                                                                                    const selected = typeof value === 'string' ? value.split(',') : value;
                                                                                                    handleAssigneeChange(list.id, card.id, selected);
                                                                                                }}
                                                                                                renderValue={(selected) => (
                                                                                                    <div className="flex flex-wrap gap-1">
                                                                                                        {selected.length} selected
                                                                                                    </div>
                                                                                                )}
                                                                                                sx={{ 
                                                                                                    height: '24px', 
                                                                                                    fontSize: '0.75rem',
                                                                                                    minWidth: '100px',
                                                                                                    '.MuiSelect-select': { padding: '2px 8px' },
                                                                                                    backgroundColor: 'background.paper',
                                                                                                    '&': { cursor: 'pointer' }
                                                                                                }}
                                                                                                MenuProps={{
                                                                                                    PaperProps: {
                                                                                                        style: { maxHeight: 200 }
                                                                                                    }
                                                                                                }}
                                                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                                                onClick={(e) => e.stopPropagation()}
                                                                                            >
                                                                                                {boardMembers.map((member) => (
                                                                                                    <MenuItem key={member.id} value={member.name} dense>
                                                                                                        <Checkbox checked={(card.assignees || []).indexOf(member.name) > -1} size="small" />
                                                                                                        <ListItemText primary={member.name} primaryTypographyProps={{ fontSize: '0.8rem' }} />
                                                                                                    </MenuItem>
                                                                                                ))}
                                                                                            </Select>
                                                                                        </div>
                                                                                    )}
                                                                                    
                                                                                    {/* Multi-Assignee Avatars */}
                                                                                    {card.assignees && card.assignees.length > 0 && (
                                                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                                                            {card.assignees.map((assigneeName, idx) => (
                                                                                                <Tooltip key={idx} title={assigneeName}>
                                                                                                    <Avatar 
                                                                                                        sx={{ 
                                                                                                            width: 24, 
                                                                                                            height: 24, 
                                                                                                            fontSize: '0.65rem',
                                                                                                            bgcolor: 'primary.main' 
                                                                                                        }}
                                                                                                    >
                                                                                                        {getInitials(assigneeName)}
                                                                                                    </Avatar>
                                                                                                </Tooltip>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Stage-specific Metadata */}
                                                                                    <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                                                                         {/* NEW: Moved By Info */}
                                                                                         {card.lastMovedBy && list.title !== 'Done' && (
                                                                                            <div className="text-indigo-400">
                                                                                                Moved by {card.lastMovedBy} 
                                                                                                {card.lastMovedAt && ` ${new Date(card.lastMovedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}`}
                                                                                            </div>
                                                                                         )}

                                                                                        {list.title === 'To Do' && card.createdAt && (
                                                                                            <div className="text-muted-foreground">Created: {new Date(card.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
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
                                                                );
                                                            })}
                                                            {provided.placeholder}
                                                            
                                                            {hasPermission && (
                                                                addingCardToList === list.id ? (
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
                                                                            backgroundColor: '#1c2c44ff', 
                                                                            color: 'white',
                                                                            '&:hover': {
                                                                                backgroundColor: '#1c2c44ff', 
                                                                            },
                                                                            'html.dark &': {
                                                                                backgroundColor: '#374151', 
                                                                                color: '#e5e7eb', 
                                                                            },
                                                                            'html.dark &:hover': {
                                                                                backgroundColor: '#4b5563', 
                                                                            }
                                                                        }}
                                                                    >
                                                                       + Add a card
                                                                    </MuiButton>
                                                                )
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
                                    {hasPermission ? (
                                        isAddingList ? (
                                            <form onSubmit={handleAddList} className="bg-card/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-lg animate-in slide-in-from-right-4 duration-200">
                                                <div className="mb-3">
                                                    <TextField
                                                        autoFocus
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        label="Section Title"
                                                        placeholder="Enter section title..."
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
                                                    <Button size="sm" type="submit">Add Section</Button>
                                                </div>
                                            </form>
                                        ) : (
                                            <button 
                                                onClick={() => setIsAddingList(true)}
                                                className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed border-border text-sm font-medium transition-all bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-sm hover:shadow-md"
                                            >
                                                <Plus size={16} />
                                                Add another section
                                            </button>
                                        )
                                    ) : (
                                         <div className="w-full p-4 border border-dashed border-border rounded-lg text-center text-muted-foreground text-sm">
                                             Only Managers can add new sections
                                         </div>
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
