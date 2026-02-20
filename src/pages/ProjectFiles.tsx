import { useState, useMemo } from 'react';
import { useBoard } from '../hooks/useBoard';
import { useAuth } from '../context/AuthContext';
import { useTeam } from '../hooks/useTeam';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TextField, Pagination, InputAdornment, IconButton, Slider,
    Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText,
    ListItemSecondaryAction, Typography, Chip, Tooltip,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
    Search as SearchIcon, Clear as ClearIcon,
    Close as CloseIcon, InsertDriveFile as InsertDriveFileIcon,
    CloudDownload as DownloadIcon, Folder as FolderIcon,
    FolderOpen as FolderOpenIcon, Lock as LockIcon,
} from '@mui/icons-material';
import type { Board, AttachedFile } from '../types';

const PRIVILEGED_ROLES = ['Manager', 'TechLead', 'Project Manager'];
const ITEMS_PER_PAGE = 20;

interface FileWithContext extends AttachedFile {
    cardName: string;
}

function getAllFilesForBoard(board: Board): FileWithContext[] {
    const result: FileWithContext[] = [];
    for (const list of board.lists) {
        for (const card of list.cards) {
            if (card.files && card.files.length > 0) {
                for (const file of card.files) {
                    result.push({ ...file, cardName: card.content });
                }
            }
        }
    }
    return result;
}

export const ProjectFiles = () => {
    const { boards } = useBoard();
    const { user } = useAuth();
    const { members } = useTeam();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [iconSize, setIconSize] = useState<number>(48);
    const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
    const [accessDenied, setAccessDenied] = useState(false);

    // Find current user in the team members list
    const currentMember = useMemo(() =>
        members.find(m => m.id === user?.uid),
        [members, user]
    );

    // Returns true if the current user can view files for this board
    const canViewFiles = (board: Board): boolean => {
        if (!currentMember) return false;
        const hasPrivilegedRole = currentMember.roles.some(r => PRIVILEGED_ROLES.includes(r));
        const isAssigned = currentMember.assignedBoardIds.includes(board.id);
        return hasPrivilegedRole || isAssigned;
    };

    const handleFolderClick = (board: Board) => {
        if (canViewFiles(board)) {
            setSelectedBoard(board);
        } else {
            setAccessDenied(true);
        }
    };

    const filteredBoards = useMemo(() => {
        return boards.filter(board =>
            board.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [boards, searchTerm]);

    const totalPages = Math.ceil(filteredBoards.length / ITEMS_PER_PAGE);

    const displayedBoards = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBoards.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredBoards, currentPage]);

    const selectedFiles = useMemo(() =>
        selectedBoard ? getAllFilesForBoard(selectedBoard) : [],
        [selectedBoard]
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="p-6 pb-20 space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">Project Files</h1>
                        <p className="text-muted-foreground mt-1">Click a project folder to view its attached files.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <TextField
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            size="small"
                            sx={{
                                width: { xs: '100%', sm: 250 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'hsl(var(--background))',
                                    color: 'hsl(var(--foreground))',
                                    '& fieldset': { borderColor: 'hsl(var(--input))' },
                                    '&:hover fieldset': { borderColor: 'hsl(var(--primary))' },
                                    '&.Mui-focused fieldset': { borderColor: 'hsl(var(--primary))' },
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: 'hsl(var(--muted-foreground))',
                                    opacity: 1,
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'hsl(var(--muted-foreground))' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                                            <ClearIcon sx={{ color: 'hsl(var(--muted-foreground))', fontSize: 18 }} />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>
                </header>

                {/* Toolbar */}
                <div className="flex items-center justify-end gap-4 px-2">
                    <div className="flex items-center gap-2 w-48">
                    
                        <Slider
                            size="small"
                            value={iconSize}
                            min={32}
                            max={128}
                            onChange={(_, v) => setIconSize(v as number)}
                            aria-label="Icon Size"
                            sx={{
                                color: 'primary.main',
                                '& .MuiSlider-thumb': {
                                    width: 12, height: 12,
                                    transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                                    '&:before': { boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)' },
                                    '&:hover, &.Mui-focusVisible': { boxShadow: '0px 0px 0px 8px rgb(0 0 0 / 16%)' },
                                    '&.Mui-active': { width: 14, height: 14 },
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Folder Grid */}
                <motion.div layout className="flex flex-wrap content-start gap-4">
                    {displayedBoards.length > 0 ? (
                        displayedBoards.map((board, index) => {
                            const fileCount = getAllFilesForBoard(board).length;
                            return (
                                <motion.div
                                    key={board.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2, delay: index * 0.04 }}
                                >
                                        <Tooltip
                                            title={canViewFiles(board) ? `${fileCount} file${fileCount !== 1 ? 's' : ''}` : 'Access restricted — not assigned to this project'}
                                            arrow
                                        >
                                            <div
                                                className="group relative flex flex-col items-center gap-2 rounded-lg hover:bg-primary/10 transition-all duration-200 text-center cursor-pointer p-2"
                                                style={{ width: iconSize * 2.5 + 'px' }}
                                                onClick={() => handleFolderClick(board)}
                                            >
                                                <div className="relative">
                                                    <div
                                                        className="flex items-center justify-center drop-shadow-sm transition-transform group-hover:scale-105 duration-300"
                                                        style={{
                                                            color: canViewFiles(board) ? (board.color || 'hsl(215 80% 60%)') : 'rgba(120,120,140,0.5)',
                                                            width: iconSize + 'px',
                                                            height: iconSize + 'px',
                                                            fontSize: iconSize + 'px'
                                                        }}
                                                    >
                                                        <FolderIcon fontSize="inherit" />
                                                    </div>
                                                    {/* Lock badge for restricted folders */}
                                                    {!canViewFiles(board) && (
                                                        <LockIcon
                                                            sx={{
                                                                position: 'absolute', bottom: 0, right: -4,
                                                                fontSize: Math.max(12, iconSize / 4),
                                                                color: 'rgba(255,80,80,0.7)',
                                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                                borderRadius: '50%', p: '2px'
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="w-full px-1">
                                                    <h3
                                                        className="font-medium leading-tight line-clamp-2 break-words group-hover:text-primary transition-colors"
                                                        style={{
                                                            fontSize: Math.max(11, iconSize / 4) + 'px',
                                                            color: canViewFiles(board) ? undefined : 'rgba(160,160,180,0.6)'
                                                        }}
                                                    >
                                                        {board.title}
                                                    </h3>
                                                </div>
                                            </div>
                                        </Tooltip>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border w-full">
                            <InsertDriveFileIcon sx={{ fontSize: 48, opacity: 0.2, mb: 2 }} />
                            <p>No projects found matching your criteria.</p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-2 text-primary hover:underline text-sm font-medium"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>

                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={(_, v) => setCurrentPage(v)}
                            color="primary"
                            shape="rounded"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    color: 'hsl(var(--foreground))',
                                    borderColor: 'hsl(var(--input))',
                                    '&:hover': { backgroundColor: 'hsl(var(--muted))' },
                                    '&.Mui-selected': {
                                        backgroundColor: 'hsl(var(--primary))',
                                        color: 'hsl(var(--primary-foreground))',
                                    }
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {/* ── File Popup Dialog ── */}
            <AnimatePresence>
                {selectedBoard && (
                    <Dialog
                        open={!!selectedBoard}
                        onClose={() => setSelectedBoard(null)}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: {
                                backgroundColor: 'rgba(15, 23, 42, 0.6) !important',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                                backgroundImage: 'none !important',
                                borderRadius: 3,
                            }
                        }}
                    >
                        {/* Dialog Header */}
                        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <FolderOpenIcon sx={{ color: selectedBoard.color || '#60a5fa', fontSize: 28 }} />
                                <div>
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.2 }}>
                                        {selectedBoard.title}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                        {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                                    </Typography>
                                </div>
                            </div>
                            <IconButton onClick={() => setSelectedBoard(null)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>

                        {/* Dialog Content */}
                        <DialogContent sx={{ p: 0 }}>
                            {selectedFiles.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                    <InsertDriveFileIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                                    <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                                        No files attached to this project yet.
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', mt: 1, display: 'block' }}>
                                        Upload files from a task card on the Board.
                                    </Typography>
                                </div>
                            ) : (
                                <List disablePadding>
                                    {selectedFiles.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.04 }}
                                        >
                                            <ListItem
                                                divider={index < selectedFiles.length - 1}
                                                sx={{
                                                    px: 3, py: 1.5,
                                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
                                                    borderColor: 'rgba(255,255,255,0.06) !important',
                                                }}
                                            >
                                                <InsertDriveFileIcon sx={{ mr: 2, color: 'rgba(255,255,255,0.35)', fontSize: 20, flexShrink: 0 }} />
                                                <ListItemText
                                                    primary={
                                                        <a
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: 'white', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}
                                                            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                                                            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                                                        >
                                                            {file.name}
                                                        </a>
                                                    }
                                                    secondary={
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                                            <Chip
                                                                label={file.cardName.length > 30 ? file.cardName.slice(0, 30) + '…' : file.cardName}
                                                                size="small"
                                                                sx={{
                                                                    height: 18, fontSize: '0.65rem',
                                                                    backgroundColor: 'rgba(255,255,255,0.07)',
                                                                    color: 'rgba(255,255,255,0.5)',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                }}
                                                            />
                                                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>
                                                                {new Date(file.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </span>
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    <Tooltip title="Download">
                                                        <IconButton
                                                            href={file.url}
                                                            download={file.name}
                                                            target="_blank"
                                                            size="small"
                                                            sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' } }}
                                                        >
                                                            <DownloadIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        </motion.div>
                                    ))}
                                </List>
                            )}
                        </DialogContent>
                    </Dialog>
                )}

                {/* ── Access Denied Dialog ── */}
                <Dialog
                    open={accessDenied}
                    onClose={() => setAccessDenied(false)}
                    maxWidth="xs"
                    PaperProps={{
                        sx: {
                            backgroundColor: 'rgba(15, 23, 42, 0.75) !important',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255,80,80,0.2)',
                            backgroundImage: 'none !important',
                            borderRadius: 3,
                            textAlign: 'center',
                            p: 2,
                        }
                    }}
                >
                    <DialogContent>
                        <LockIcon sx={{ fontSize: 52, color: 'rgba(255,80,80,0.7)', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                            Access Restricted
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            You don't have permission to view files for this project.
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', mt: 1, display: 'block' }}>
                            Only Managers, TechLeads, Project Managers, and assigned team members can access project files.
                        </Typography>
                        <button
                            onClick={() => setAccessDenied(false)}
                            style={{
                                marginTop: 20,
                                padding: '8px 24px',
                                borderRadius: 8,
                                border: '1px solid rgba(255,255,255,0.15)',
                                backgroundColor: 'rgba(255,255,255,0.07)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                            }}
                        >
                            Close
                        </button>
                    </DialogContent>
                </Dialog>
            </AnimatePresence>
        </LocalizationProvider>
    );
};
